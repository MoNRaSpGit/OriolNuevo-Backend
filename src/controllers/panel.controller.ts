import type { Request, Response } from "express";
import { pool } from "../config/db";
import { TASA_DOLAR } from "../config/constants";
import { rangoHoyUruguay } from "../utils/fechas";
import type { MetodoPago } from "../types/venta";
import type { PanelHoy, TotalPorMoneda } from "../types/panel";

interface FilaTotalPorMetodo {
  metodo_pago: MetodoPago;
  pesos: string | null;
  dolares: string | null;
}

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

    const panel: PanelHoy = {
      totalTarjeta: totales.tarjeta,
      totalEfectivo: totales.efectivo,
      totalCredito: totales.credito,
      totalPagos,
      cambio,
      caja,
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
