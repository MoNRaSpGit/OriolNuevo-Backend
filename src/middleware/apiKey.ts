import type { NextFunction, Request, Response } from "express";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY no esta configurada en el servidor: se rechazan todas las requests.");
    res.status(500).json({ error: "Servidor mal configurado" });
    return;
  }

  const provided = req.header("x-api-key");
  if (provided !== apiKey) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  next();
}
