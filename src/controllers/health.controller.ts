import type { Request, Response } from "express";
import { pool } from "../config/db";

// Hace una consulta real (no solo confirma que el proceso de Express está
// arriba): así el keepalive del frontend (ver NavBar.tsx) también mantiene
// con actividad real a la base, no solo al backend, y el indicador
// "Conectado" refleja si la app es realmente usable, no solo si el server
// responde.
export async function health(_req: Request, res: Response) {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Error de conexión a la base de datos:", (err as Error).message);
    res.status(503).json({ status: "error" });
  }
}
