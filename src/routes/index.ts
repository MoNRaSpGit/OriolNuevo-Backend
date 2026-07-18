import { Router } from "express";
import healthRoutes from "./health.routes";
import productosRoutes from "./productos.routes";
import clientesRoutes from "./clientes.routes";
import ventasRoutes from "./ventas.routes";
import pagosRoutes from "./pagos.routes";
import panelRoutes from "./panel.routes";
import { requireApiKey } from "../middleware/apiKey";

const router = Router();

// Publico: sin API key, para health checks externos (Render, uptime monitors).
router.use(healthRoutes);

// Todo lo demas requiere la API key compartida.
router.use(requireApiKey);
router.use("/productos", productosRoutes);
router.use("/clientes", clientesRoutes);
router.use("/ventas", ventasRoutes);
router.use("/pagos", pagosRoutes);
router.use("/panel", panelRoutes);

export default router;
