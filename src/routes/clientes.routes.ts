import { Router } from "express";
import * as clientesController from "../controllers/clientes.controller";
import { validarBody } from "../middleware/validarBody";
import { clienteSchema } from "../validators/cliente.schema";

const router = Router();

router.get("/", clientesController.listar);
router.get("/:id", clientesController.obtenerPorId);
router.get("/:id/historial", clientesController.obtenerHistorial);
router.post("/", validarBody(clienteSchema), clientesController.crear);

export default router;
