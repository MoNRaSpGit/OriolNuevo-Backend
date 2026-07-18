import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";
import type { Producto, ProductoInput } from "../types/producto";

const TABLA = "oriolnuevo_prodcutos";

export async function listar(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${TABLA}`);
    res.json(rows as Producto[]);
  } catch (err) {
    console.error("Error al obtener productos:", (err as Error).message);
    res.status(500).json({ error: "Error al obtener productos" });
  }
}

export async function obtenerPorCodigoBarra(req: Request, res: Response) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM ${TABLA} WHERE codigo_barra = ?`,
      [req.params.codigoBarra]
    );
    const results = rows as Producto[];
    if (results.length === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Error al buscar por codigo de barra:", (err as Error).message);
    res.status(500).json({ error: "Error al buscar el producto" });
  }
}

export async function obtenerPorId(req: Request, res: Response) {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${TABLA} WHERE id = ?`, [
      req.params.id,
    ]);
    const results = rows as Producto[];
    if (results.length === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Error al obtener el producto:", (err as Error).message);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
}

export async function crear(req: Request, res: Response) {
  const { name, price, image, description, currency, codigo_barra, stock } =
    req.body as ProductoInput;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ${TABLA} (name, price, image, description, currency, codigo_barra, stock) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, price, image, description, currency, codigo_barra || null, stock || 0]
    );
    res.json({
      id: result.insertId,
      name,
      price,
      image,
      description,
      currency,
      codigo_barra,
      stock: stock || 0,
    });
  } catch (err) {
    console.error("Error al insertar producto:", (err as Error).message);
    res.status(500).json({ error: "Error al insertar producto" });
  }
}

export async function actualizar(req: Request, res: Response) {
  const { id } = req.params;
  const { name, price, image, description, currency, codigo_barra, stock } =
    req.body as ProductoInput;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE ${TABLA} SET name = ?, price = ?, image = ?, description = ?, currency = ?, codigo_barra = ?, stock = ? WHERE id = ?`,
      [name, price, image, description, currency, codigo_barra || null, stock || 0, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json({ id, name, price, image, description, currency, codigo_barra, stock });
  } catch (err) {
    console.error("Error al actualizar producto:", (err as Error).message);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
}

export async function eliminar(req: Request, res: Response) {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM ${TABLA} WHERE id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar producto:", (err as Error).message);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
}
