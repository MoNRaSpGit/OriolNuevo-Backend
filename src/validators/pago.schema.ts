import { z } from "zod";

export const pagoSchema = z.object({
  valor: z.number().positive("El valor debe ser mayor a 0"),
  detalle: z.string().trim().min(1, "El detalle es obligatorio"),
});
