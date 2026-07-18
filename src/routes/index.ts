import { Router } from "express";
import healthRoutes from "./health.routes";
import productosRoutes from "./productos.routes";

const router = Router();

router.use(healthRoutes);
router.use("/productos", productosRoutes);

export default router;
