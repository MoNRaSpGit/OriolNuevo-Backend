import { Router } from "express";
import * as clientesController from "../controllers/clientes.controller";

const router = Router();

router.get("/", clientesController.listar);
router.get("/:id", clientesController.obtenerPorId);
router.get("/:id/historial", clientesController.obtenerHistorial);
router.post("/", clientesController.crear);

export default router;
