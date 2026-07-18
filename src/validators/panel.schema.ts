import { z } from "zod";

export const cambioSchema = z.object({
  cambio: z.number().nonnegative("El cambio no puede ser negativo"),
});
