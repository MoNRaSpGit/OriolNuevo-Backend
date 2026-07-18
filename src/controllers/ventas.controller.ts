import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";
import { TASA_DOLAR } from "../config/constants";
import type { VentaCreditoInput } from "../types/cliente";

export async function crearVentaCredito(req: Request, res: Response) {
  const { cliente_id, total_pesos, total_dolares, items } =
    req.body as VentaCreditoInput;

  const deudaEquivalente = total_pesos + total_dolares * TASA_DOLAR;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO oriolnuevo_ventas_credito (cliente_id, total_pesos, total_dolares, detalle) VALUES (?, ?, ?, ?)`,
      [cliente_id, total_pesos, total_dolares, JSON.stringify(items)]
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

    await connection.commit();
    res.json({
      id: result.insertId,
      cliente_id,
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
