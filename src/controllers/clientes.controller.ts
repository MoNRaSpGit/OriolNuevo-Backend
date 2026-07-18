import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";
import { ahoraUtc } from "../utils/fechas";
import type { Cliente, ClienteInput } from "../types/cliente";
import type { Venta } from "../types/venta";

const TABLA = "oriolnuevo_clientes";
const TABLA_VENTAS = "oriolnuevo_ventas";

export async function listar(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${TABLA} ORDER BY nombre`);
    res.json(rows as Cliente[]);
  } catch (err) {
    console.error("Error al obtener clientes:", (err as Error).message);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
}

export async function obtenerPorId(req: Request, res: Response) {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${TABLA} WHERE id = ?`, [
      req.params.id,
    ]);
    const results = rows as Cliente[];
    if (results.length === 0) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Error al obtener el cliente:", (err as Error).message);
    res.status(500).json({ error: "Error al obtener el cliente" });
  }
}

export async function crear(req: Request, res: Response) {
  const { nombre, telefono } = req.body as ClienteInput;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ${TABLA} (nombre, telefono, created_at) VALUES (?, ?, ?)`,
      [nombre, telefono || null, ahoraUtc()]
    );
    res.json({ id: result.insertId, nombre, telefono: telefono || null, deuda: "0.00" });
  } catch (err) {
    console.error("Error al crear cliente:", (err as Error).message);
    res.status(500).json({ error: "Error al crear cliente" });
  }
}

export async function obtenerHistorial(req: Request, res: Response) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM ${TABLA_VENTAS} WHERE cliente_id = ? ORDER BY fecha DESC`,
      [req.params.id]
    );
    res.json(rows as Venta[]);
  } catch (err) {
    console.error("Error al obtener historial:", (err as Error).message);
    res.status(500).json({ error: "Error al obtener historial" });
  }
}
