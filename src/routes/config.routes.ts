import { Router } from "express";
import { obtenerConfig } from "../controllers/config.controller";

const router = Router();

router.get("/", obtenerConfig);

export default router;
