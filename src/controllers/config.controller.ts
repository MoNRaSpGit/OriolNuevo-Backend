import type { Request, Response } from "express";
import { TASA_DOLAR } from "../config/constants";

export function obtenerConfig(_req: Request, res: Response) {
  res.json({ tasa_dolar: TASA_DOLAR });
}
