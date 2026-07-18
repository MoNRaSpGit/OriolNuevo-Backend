import { Router } from "express";
import { crearVentaCredito, crearVentaContado } from "../controllers/ventas.controller";
import { validarBody } from "../middleware/validarBody";
import { ventaCreditoSchema, ventaContadoSchema } from "../validators/venta.schema";

const router = Router();

router.post("/credito", validarBody(ventaCreditoSchema), crearVentaCredito);
router.post("/contado", validarBody(ventaContadoSchema), crearVentaContado);

export default router;
