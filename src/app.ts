import cors from "cors";
import express from "express";
import apiRoutes from "./routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api", apiRoutes);

  return app;
}
