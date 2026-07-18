import { z } from "zod";

const itemVentaSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  cantidad: z.number().int().positive(),
  precio: z.number().nonnegative(),
  currency: z.enum(["UYU", "USD"]),
});

export const ventaCreditoSchema = z.object({
  cliente_id: z.number().int().positive(),
  total_pesos: z.number().nonnegative(),
  total_dolares: z.number().nonnegative(),
  items: z.array(itemVentaSchema).min(1, "Debe incluir al menos un producto"),
});

export const ventaContadoSchema = z.object({
  metodo_pago: z.enum(["efectivo", "tarjeta"]),
  total_pesos: z.number().nonnegative(),
  total_dolares: z.number().nonnegative(),
  items: z.array(itemVentaSchema).min(1, "Debe incluir al menos un producto"),
});
