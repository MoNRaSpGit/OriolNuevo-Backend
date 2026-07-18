import { Router } from "express";
import * as pagosController from "../controllers/pagos.controller";
import { validarBody } from "../middleware/validarBody";
import { pagoSchema } from "../validators/pago.schema";

const router = Router();

router.get("/", pagosController.listar);
router.post("/", validarBody(pagoSchema), pagosController.crear);

export default router;
