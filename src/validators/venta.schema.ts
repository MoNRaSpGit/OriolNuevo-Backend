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
  // Opcional: permite guardar a qué cliente se le vendió (sin que la venta
  // sea a crédito), para poder reimprimir su boleta después. No afecta la
  // deuda — eso solo pasa en ventaCreditoSchema.
  cliente_id: z.number().int().positive().optional(),
});

// Corrección de una venta ya confirmada (método de pago y/o fecha). El
// cliente solo es obligatorio si se pasa a crédito y la venta no tenía
// uno vinculado — esa validación depende del estado actual de la venta,
// así que se resuelve en el controller, no acá.
export const ventaActualizarSchema = z
  .object({
    metodo_pago: z.enum(["efectivo", "tarjeta", "credito"]).optional(),
    fecha: z.coerce.date().optional(),
    cliente_id: z.number().int().positive().optional(),
  })
  .refine((data) => data.metodo_pago !== undefined || data.fecha !== undefined, {
    message: "Debe incluir metodo_pago o fecha",
  });
