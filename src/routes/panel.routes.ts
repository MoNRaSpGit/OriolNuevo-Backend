import { Router } from "express";
import * as panelController from "../controllers/panel.controller";
import { validarBody } from "../middleware/validarBody";
import { cambioSchema } from "../validators/panel.schema";

const router = Router();

router.get("/hoy", panelController.obtenerHoy);
router.get("/mes/:anio/:mes", panelController.obtenerMes);
router.put("/cambio", validarBody(cambioSchema), panelController.actualizarCambio);

export default router;
