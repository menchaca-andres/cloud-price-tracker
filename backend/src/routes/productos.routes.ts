import { Router } from "express";
import { crearProducto, listarProductos, obtenerHistorial } from "../controllers/productos.controller";

const router = Router();

router.post("/", crearProducto);
router.get("/", listarProductos);
router.get("/:id_historial/historial", obtenerHistorial);

export default router;