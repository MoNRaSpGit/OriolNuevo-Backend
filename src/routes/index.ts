import { Router } from "express";
import healthRoutes from "./health.routes";
import productosRoutes from "./productos.routes";
import clientesRoutes from "./clientes.routes";
import ventasRoutes from "./ventas.routes";
import pagosRoutes from "./pagos.routes";
import panelRoutes from "./panel.routes";

const router = Router();

router.use(healthRoutes);
router.use("/productos", productosRoutes);
router.use("/clientes", clientesRoutes);
router.use("/ventas", ventasRoutes);
router.use("/pagos", pagosRoutes);
router.use("/panel", panelRoutes);

export default router;
