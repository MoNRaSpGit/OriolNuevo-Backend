import type { Request, Response } from "express";
import { pool } from "../config/db";
import { TASA_DOLAR } from "../config/constants";
import { rangoHoyUruguay } from "../utils/fechas";
import type { ItemVenta, MetodoPago } from "../types/venta";
import type { MovimientoPanel, PanelHoy, TotalPorMoneda } from "../types/panel";

interface FilaTotalPorMetodo {
  metodo_pago: MetodoPago;
  pesos: string | null;
  dolares: string | null;
}

interface FilaVentaDetalle {
  detalle: string;
  fecha: Date;
}

interface FilaPagoDetalle {
  valor: string;
  detalle: string;
  fecha: Date;
}

// El 30% se resta de la ganancia bruta (ventas del día - pagos a
// proveedores) como estimación de gastos/impuestos, a pedido del
// usuario.
const PORCENTAJE_GANANCIA_NETA = 0.7;

export async function obtenerHoy(_req: Request, res: Response) {
  try {
    const { inicio, fin } = rangoHoyUruguay();

    const [ventasRows] = await pool.query(
      `SELECT metodo_pago, SUM(total_pesos) as pesos, SUM(total_dolares) as dolares
       FROM oriolnuevo_ventas
       WHERE fecha >= ? AND fecha < ?
       GROUP BY metodo_pago`,
      [inicio, fin]
    );

    const totales: Record<MetodoPago, TotalPorMoneda> = {
      efectivo: { pesos: 0, dolares: 0 },
      tarjeta: { pesos: 0, dolares: 0 },
      credito: { pesos: 0, dolares: 0 },
    };
    for (const fila of ventasRows as FilaTotalPorMetodo[]) {
      totales[fila.metodo_pago] = {
        pesos: Number(fila.pesos) || 0,
        dolares: Number(fila.dolares) || 0,
      };
    }

    const [pagosRows] = await pool.query(
      `SELECT COALESCE(SUM(valor), 0) as total FROM oriolnuevo_pagos WHERE fecha >= ? AND fecha < ?`,
      [inicio, fin]
    );
    const totalPagos = Number((pagosRows as { total: string }[])[0].total) || 0;

    const [cajaRows] = await pool.query(
      `SELECT cambio FROM oriolnuevo_config WHERE id = 1`
    );
    const cambio = Number((cajaRows as { cambio: string }[])[0]?.cambio) || 0;

    const efectivoEquivalente =
      totales.efectivo.pesos + totales.efectivo.dolares * TASA_DOLAR;
    const caja = cambio + efectivoEquivalente - totalPagos;

    const ventasTotalEquivalente =
      totales.efectivo.pesos +
      totales.efectivo.dolares * TASA_DOLAR +
      totales.tarjeta.pesos +
      totales.tarjeta.dolares * TASA_DOLAR +
      totales.credito.pesos +
      totales.credito.dolares * TASA_DOLAR;
    const gananciaBruta = ventasTotalEquivalente - totalPagos;
    const ganancias = gananciaBruta * PORCENTAJE_GANANCIA_NETA;

    const [ventasDetalleRows] = await pool.query(
      `SELECT detalle, fecha FROM oriolnuevo_ventas WHERE fecha >= ? AND fecha < ? ORDER BY fecha DESC`,
      [inicio, fin]
    );
    const [pagosDetalleRows] = await pool.query(
      `SELECT valor, detalle, fecha FROM oriolnuevo_pagos WHERE fecha >= ? AND fecha < ? ORDER BY fecha DESC`,
      [inicio, fin]
    );

    const movimientos: MovimientoPanel[] = [];

    for (const venta of ventasDetalleRows as FilaVentaDetalle[]) {
      const fechaIso = venta.fecha.toISOString();
      let items: ItemVenta[] = [];
      try {
        items = JSON.parse(venta.detalle);
      } catch {
        items = [];
      }
      for (const item of items) {
        movimientos.push({
          tipo: "venta",
          descripcion: item.name,
          cantidad: item.cantidad,
          monto: item.precio * item.cantidad,
          currency: item.currency,
          fecha: fechaIso,
        });
      }
    }

    for (const pago of pagosDetalleRows as FilaPagoDetalle[]) {
      movimientos.push({
        tipo: "pago",
        descripcion: pago.detalle,
        cantidad: null,
        monto: Number(pago.valor),
        currency: null,
        fecha: pago.fecha.toISOString(),
      });
    }

    movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    const panel: PanelHoy = {
      totalTarjeta: totales.tarjeta,
      totalEfectivo: totales.efectivo,
      totalCredito: totales.credito,
      totalPagos,
      cambio,
      caja,
      ganancias,
      movimientos,
    };

    res.json(panel);
  } catch (err) {
    console.error("Error al obtener el panel:", (err as Error).message);
    res.status(500).json({ error: "Error al obtener el panel" });
  }
}

export async function actualizarCambio(req: Request, res: Response) {
  const { cambio } = req.body as { cambio: number };
  try {
    await pool.query(
      `INSERT INTO oriolnuevo_config (id, cambio) VALUES (1, ?) ON DUPLICATE KEY UPDATE cambio = ?`,
      [cambio, cambio]
    );
    res.json({ cambio });
  } catch (err) {
    console.error("Error al actualizar el cambio:", (err as Error).message);
    res.status(500).json({ error: "Error al actualizar el cambio" });
  }
}
