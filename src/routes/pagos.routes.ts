import { Router } from "express";
import * as pagosController from "../controllers/pagos.controller";

const router = Router();

router.get("/", pagosController.listar);
router.post("/", pagosController.crear);

export default router;
