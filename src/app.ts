import cors from "cors";
import express from "express";
import apiRoutes from "./routes";
import { corsOptions } from "./config/cors";

export function createApp() {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/api", apiRoutes);

  return app;
}
