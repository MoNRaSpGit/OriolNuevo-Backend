import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";
import { ahoraUtc } from "../utils/fechas";
import type { Pago, PagoInput } from "../types/pago";

const TABLA = "oriolnuevo_pagos";

export async function listar(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${TABLA} ORDER BY fecha DESC`);
    res.json(rows as Pago[]);
  } catch (err) {
    console.error("Error al obtener pagos:", (err as Error).message);
    res.status(500).json({ error: "Error al obtener pagos" });
  }
}

export async function crear(req: Request, res: Response) {
  const { valor, detalle } = req.body as PagoInput;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ${TABLA} (valor, detalle, fecha) VALUES (?, ?, ?)`,
      [valor, detalle, ahoraUtc()]
    );
    res.json({ id: result.insertId, valor, detalle });
  } catch (err) {
    console.error("Error al crear pago:", (err as Error).message);
    res.status(500).json({ error: "Error al crear pago" });
  }
}
