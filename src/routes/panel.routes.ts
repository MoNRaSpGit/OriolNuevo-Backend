import { Router } from "express";
import * as panelController from "../controllers/panel.controller";

const router = Router();

router.get("/hoy", panelController.obtenerHoy);
router.put("/cambio", panelController.actualizarCambio);

export default router;
