import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validarBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Datos invalidos", detalles: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };
}
