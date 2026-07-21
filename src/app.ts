import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import apiRoutes from "./routes";
import { corsOptions } from "./config/cors";

export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/api", apiRoutes);

  // Cualquier error no manejado (incluido el que tira el middleware de CORS)
  // responde JSON en vez de la pagina HTML generica de Express.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error no manejado:", err.message);
    res.status(500).json({ error: err.message || "Error interno del servidor" });
  });

  return app;
}
