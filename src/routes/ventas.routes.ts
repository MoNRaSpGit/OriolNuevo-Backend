import { Router } from "express";
import { crearVentaCredito, crearVentaContado, actualizarVenta } from "../controllers/ventas.controller";
import { validarBody } from "../middleware/validarBody";
import { ventaCreditoSchema, ventaContadoSchema, ventaActualizarSchema } from "../validators/venta.schema";

const router = Router();

router.post("/credito", validarBody(ventaCreditoSchema), crearVentaCredito);
router.post("/contado", validarBody(ventaContadoSchema), crearVentaContado);
router.put("/:id", validarBody(ventaActualizarSchema), actualizarVenta);

export default router;
