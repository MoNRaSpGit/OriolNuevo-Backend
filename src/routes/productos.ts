import { Router } from "express";
import { pool } from "../db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM oriolnuevo_prodcutos");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener productos:", (err as Error).message);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

router.get("/codigo/:codigoBarra", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM oriolnuevo_prodcutos WHERE codigo_barra = ?",
      [req.params.codigoBarra]
    );
    const results = rows as any[];
    if (results.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Error al buscar por codigo de barra:", (err as Error).message);
    res.status(500).json({ error: "Error al buscar el producto" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM oriolnuevo_prodcutos WHERE id = ?",
      [req.params.id]
    );
    const results = rows as any[];
    if (results.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Error al obtener el producto:", (err as Error).message);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

router.post("/", async (req, res) => {
  const { name, price, image, description, currency, codigo_barra } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO oriolnuevo_prodcutos (name, price, image, description, currency, codigo_barra) VALUES (?, ?, ?, ?, ?, ?)",
      [name, price, image, description, currency, codigo_barra || null]
    );
    const insertId = (result as any).insertId;
    res.json({ id: insertId, name, price, image, description, currency, codigo_barra });
  } catch (err) {
    console.error("Error al insertar producto:", (err as Error).message);
    res.status(500).json({ error: "Error al insertar producto" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, image, description, currency, codigo_barra } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE oriolnuevo_prodcutos SET name = ?, price = ?, image = ?, description = ?, currency = ?, codigo_barra = ? WHERE id = ?",
      [name, price, image, description, currency, codigo_barra || null, id]
    );
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ id, name, price, image, description, currency, codigo_barra });
  } catch (err) {
    console.error("Error al actualizar producto:", (err as Error).message);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM oriolnuevo_prodcutos WHERE id = ?",
      [req.params.id]
    );
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar producto:", (err as Error).message);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

export default router;
