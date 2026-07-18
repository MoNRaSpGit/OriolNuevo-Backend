import { Router } from "express";
import { crearVentaCredito, crearVentaContado } from "../controllers/ventas.controller";

const router = Router();

router.post("/credito", crearVentaCredito);
router.post("/contado", crearVentaContado);

export default router;
