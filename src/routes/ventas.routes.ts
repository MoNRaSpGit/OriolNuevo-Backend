import { Router } from "express";
import { crearVentaCredito } from "../controllers/ventas.controller";

const router = Router();

router.post("/credito", crearVentaCredito);

export default router;
