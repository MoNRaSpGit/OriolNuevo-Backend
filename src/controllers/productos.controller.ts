import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";
import type { Producto, ProductoInput } from "../types/producto";

const TABLA = "oriolnuevo_prodcutos";

// La imagen (columna `image`, base64 heredado de la tabla vieja) nunca se
// usa en la UI — se dejó de pedir/guardar por API para no mandar varios MB
// de datos innecesarios en cada listado/búsqueda. La columna sigue
// existiendo en la BDD, simplemente no forma parte del contrato de la API.
const COLUMNAS = "id, name, price, description, currency, codigo_barra, stock";

export async function listar(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query(`SELECT ${COLUMNAS} FROM ${TABLA}`);
    res.json(rows as Producto[]);
  } catch (err) {
    console.error("Error al obtener productos:", (err as Error).message);
    res.status(500).json({ error: "Error al obtener productos" });
  }
}

export async function obtenerPorCodigoBarra(req: Request, res: Response) {
  try {
    const [rows] = await pool.query(
      `SELECT ${COLUMNAS} FROM ${TABLA} WHERE codigo_barra = ?`,
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

export async function buscarPorNombre(req: Request, res: Response) {
  try {
    const query = String(req.query.q || "").trim();
    if (query.length < 2) {
      res.json([]);
      return;
    }
    const [rows] = await pool.query(
      `SELECT ${COLUMNAS} FROM ${TABLA} WHERE name LIKE ? ORDER BY name LIMIT 20`,
      [`%${query}%`]
    );
    res.json(rows as Producto[]);
  } catch (err) {
    console.error("Error al buscar por nombre:", (err as Error).message);
    res.status(500).json({ error: "Error al buscar productos" });
  }
}

export async function obtenerPorId(req: Request, res: Response) {
  try {
    const [rows] = await pool.query(`SELECT ${COLUMNAS} FROM ${TABLA} WHERE id = ?`, [
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
  const { name, price, description, currency, codigo_barra, stock } =
    req.body as ProductoInput;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ${TABLA} (name, price, description, currency, codigo_barra, stock) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, price, description, currency, codigo_barra || null, stock || 0]
    );
    res.json({
      id: result.insertId,
      name,
      price,
      description,
      currency,
      codigo_barra,
      stock: stock || 0,
    });
  } catch (err) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Ya existe un producto con ese código de barra" });
      return;
    }
    console.error("Error al insertar producto:", (err as Error).message);
    res.status(500).json({ error: "Error al insertar producto" });
  }
}

export async function actualizar(req: Request, res: Response) {
  const { id } = req.params;
  const { name, price, description, currency, codigo_barra, stock } =
    req.body as ProductoInput;
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE ${TABLA} SET name = ?, price = ?, description = ?, currency = ?, codigo_barra = ?, stock = ? WHERE id = ?`,
      [name, price, description, currency, codigo_barra || null, stock || 0, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Producto no encontrado" });
      return;
    }
    res.json({ id, name, price, description, currency, codigo_barra, stock });
  } catch (err) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      res.status(409).json({ error: "Ya existe un producto con ese código de barra" });
      return;
    }
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
