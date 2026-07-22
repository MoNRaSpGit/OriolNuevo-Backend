import type { Request, Response } from "express";
import { pool } from "../config/db";
import { rangoHoyUruguay } from "../utils/fechas";
import { armarMovimientos, calcularCaja, calcularGanancia, equivalenteEnPesos } from "../utils/panelCalculos";
import type { MetodoPago } from "../types/venta";
import type { PanelHoy, TotalPorMoneda } from "../types/panel";

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

    const efectivoEquivalente = equivalenteEnPesos(totales.efectivo);
    const caja = calcularCaja(cambio, efectivoEquivalente, totalPagos);
    const ganancias = calcularGanancia(efectivoEquivalente, totalPagos);

    const [ventasDetalleRows] = await pool.query(
      `SELECT detalle, fecha FROM oriolnuevo_ventas WHERE fecha >= ? AND fecha < ? ORDER BY fecha DESC`,
      [inicio, fin]
    );
    const [pagosDetalleRows] = await pool.query(
      `SELECT valor, detalle, fecha FROM oriolnuevo_pagos WHERE fecha >= ? AND fecha < ? ORDER BY fecha DESC`,
      [inicio, fin]
    );

    const movimientos = armarMovimientos(
      ventasDetalleRows as FilaVentaDetalle[],
      pagosDetalleRows as FilaPagoDetalle[]
    );

    const panel: PanelHoy = {
      totalTarjeta: totales.tarjeta,
      totalEfectivo: totales.efectivo,
      totalCredito: totales.credito,
      totalPagos,
      cambio,
      caja,
      ventasDelDia: efectivoEquivalente,
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
