import { Router } from "express";
import * as productosController from "../controllers/productos.controller";
import { validarBody } from "../middleware/validarBody";
import { productoSchema } from "../validators/producto.schema";

const router = Router();

router.get("/", productosController.listar);
router.get("/buscar", productosController.buscarPorNombre);
router.get("/codigo/:codigoBarra", productosController.obtenerPorCodigoBarra);
router.get("/:id", productosController.obtenerPorId);
router.post("/", validarBody(productoSchema), productosController.crear);
router.put("/:id", validarBody(productoSchema), productosController.actualizar);
router.delete("/:id", productosController.eliminar);

export default router;
