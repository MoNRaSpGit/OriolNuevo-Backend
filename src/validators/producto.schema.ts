import { z } from "zod";

export const productoSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  description: z.string().optional().default(""),
  currency: z.enum(["UYU", "USD"]),
  codigo_barra: z.string().trim().optional(),
  stock: z.number().int("El stock debe ser un entero").nonnegative("El stock no puede ser negativo").optional().default(0),
});

export const stockSchema = z
  .object({
    stock: z.number().int("El stock debe ser un entero").nonnegative("El stock no puede ser negativo").optional(),
    stock_minimo: z
      .number()
      .int("El stock mínimo debe ser un entero")
      .nonnegative("El stock mínimo no puede ser negativo")
      .nullable()
      .optional(),
  })
  .refine((data) => data.stock !== undefined || data.stock_minimo !== undefined, {
    message: "Debe incluir stock o stock_minimo",
  });
