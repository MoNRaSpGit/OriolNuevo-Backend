import type { Request, Response } from "express";
import type { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { pool } from "../config/db";
import { TASA_DOLAR } from "../config/constants";
import { ahoraUtc } from "../utils/fechas";
import type { ItemVenta, MetodoPago, VentaActualizarInput, VentaContadoInput, VentaCreditoInput } from "../types/venta";

async function descontarStock(connection: PoolConnection, items: ItemVenta[]) {
  for (const item of items) {
    await connection.query(
      "UPDATE oriolnuevo_prodcutos SET stock = GREATEST(stock - ?, 0) WHERE id = ?",
      [item.cantidad, item.id]
    );
  }
}

export async function crearVentaCredito(req: Request, res: Response) {
  const { cliente_id, total_pesos, total_dolares, items } =
    req.body as VentaCreditoInput;

  const deudaEquivalente = total_pesos + total_dolares * TASA_DOLAR;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO oriolnuevo_ventas (cliente_id, metodo_pago, total_pesos, total_dolares, detalle, fecha) VALUES (?, 'credito', ?, ?, ?, ?)`,
      [cliente_id, total_pesos, total_dolares, JSON.stringify(items), ahoraUtc()]
    );

    const [updateResult] = await connection.query<ResultSetHeader>(
      `UPDATE oriolnuevo_clientes SET deuda = deuda + ? WHERE id = ?`,
      [deudaEquivalente, cliente_id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }

    await descontarStock(connection, items);

    await connection.commit();
    res.json({
      id: result.insertId,
      cliente_id,
      metodo_pago: "credito",
      total_pesos,
      total_dolares,
      items,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error al registrar venta a credito:", (err as Error).message);
    res.status(500).json({ error: "Error al registrar la venta" });
  } finally {
    connection.release();
  }
}

export async function crearVentaContado(req: Request, res: Response) {
  const { metodo_pago, total_pesos, total_dolares, items, cliente_id } =
    req.body as VentaContadoInput;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query<ResultSetHeader>(
      `INSERT INTO oriolnuevo_ventas (cliente_id, metodo_pago, total_pesos, total_dolares, detalle, fecha) VALUES (?, ?, ?, ?, ?, ?)`,
      [cliente_id || null, metodo_pago, total_pesos, total_dolares, JSON.stringify(items), ahoraUtc()]
    );

    await descontarStock(connection, items);

    await connection.commit();
    res.json({ ok: true });
  } catch (err) {
    await connection.rollback();
    console.error("Error al registrar venta de contado:", (err as Error).message);
    res.status(500).json({ error: "Error al registrar la venta" });
  } finally {
    connection.release();
  }
}

interface FilaVentaActual {
  metodo_pago: MetodoPago;
  cliente_id: number | null;
  total_pesos: string;
  total_dolares: string;
}

// Corrige una venta ya confirmada (método de pago y/o fecha). Como
// "Confirmar" ya es la fuente de verdad (ver Scanner: la venta se guarda
// ahí, imprimir es un paso aparte y no afecta nada), esta corrección
// actúa directo sobre la fila ya guardada. El único dato acumulado que
// hay que mantener consistente a mano es la deuda del cliente cuando el
// método de pago entra o sale de "crédito" — el Panel de Control no
// necesita ningún ajuste porque recalcula todo en vivo desde
// oriolnuevo_ventas en cada consulta.
export async function actualizarVenta(req: Request, res: Response) {
  const { id } = req.params;
  const { metodo_pago, fecha, cliente_id } = req.body as VentaActualizarInput;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT metodo_pago, cliente_id, total_pesos, total_dolares FROM oriolnuevo_ventas WHERE id = ?`,
      [id]
    );
    const ventaActual = (rows as FilaVentaActual[])[0];
    if (!ventaActual) {
      await connection.rollback();
      res.status(404).json({ error: "Venta no encontrada" });
      return;
    }

    const metodoActual = ventaActual.metodo_pago;
    const metodoNuevo = metodo_pago ?? metodoActual;
    const clienteIdFinal = cliente_id ?? ventaActual.cliente_id;
    const equivalente = Number(ventaActual.total_pesos) + Number(ventaActual.total_dolares) * TASA_DOLAR;

    if (metodoNuevo !== metodoActual) {
      if (metodoActual === "credito" && ventaActual.cliente_id) {
        await connection.query(`UPDATE oriolnuevo_clientes SET deuda = deuda - ? WHERE id = ?`, [
          equivalente,
          ventaActual.cliente_id,
        ]);
      }
      if (metodoNuevo === "credito") {
        if (!clienteIdFinal) {
          await connection.rollback();
          res.status(400).json({ error: "Para pasar a crédito hay que indicar un cliente" });
          return;
        }
        const [updateResult] = await connection.query<ResultSetHeader>(
          `UPDATE oriolnuevo_clientes SET deuda = deuda + ? WHERE id = ?`,
          [equivalente, clienteIdFinal]
        );
        if (updateResult.affectedRows === 0) {
          await connection.rollback();
          res.status(404).json({ error: "Cliente no encontrado" });
          return;
        }
      }
    }

    const sets = ["metodo_pago = ?", "cliente_id = ?"];
    const params: (string | number | Date | null)[] = [metodoNuevo, clienteIdFinal || null];
    if (fecha) {
      sets.push("fecha = ?");
      params.push(fecha);
    }
    params.push(id);

    await connection.query(`UPDATE oriolnuevo_ventas SET ${sets.join(", ")} WHERE id = ?`, params);

    await connection.commit();
    res.json({ ok: true });
  } catch (err) {
    await connection.rollback();
    console.error("Error al actualizar venta:", (err as Error).message);
    res.status(500).json({ error: "Error al actualizar la venta" });
  } finally {
    connection.release();
  }
}
