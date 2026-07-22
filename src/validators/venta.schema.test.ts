import { ventaContadoSchema, ventaCreditoSchema } from "./venta.schema";

const itemValido = { id: 1, name: "Coca Cola", cantidad: 1, precio: 85, currency: "UYU" as const };

describe("ventaContadoSchema", () => {
  it("acepta efectivo y tarjeta", () => {
    expect(ventaContadoSchema.safeParse({ metodo_pago: "efectivo", total_pesos: 85, total_dolares: 0, items: [itemValido] }).success).toBe(true);
    expect(ventaContadoSchema.safeParse({ metodo_pago: "tarjeta", total_pesos: 85, total_dolares: 0, items: [itemValido] }).success).toBe(true);
  });

  it("rechaza metodo_pago inválido (ej. 'credito', que va por el endpoint de crédito)", () => {
    const resultado = ventaContadoSchema.safeParse({
      metodo_pago: "credito",
      total_pesos: 85,
      total_dolares: 0,
      items: [itemValido],
    });
    expect(resultado.success).toBe(false);
  });

  it("rechaza un array de items vacío", () => {
    const resultado = ventaContadoSchema.safeParse({
      metodo_pago: "efectivo",
      total_pesos: 0,
      total_dolares: 0,
      items: [],
    });
    expect(resultado.success).toBe(false);
  });
});

describe("ventaCreditoSchema", () => {
  it("exige cliente_id positivo", () => {
    const resultado = ventaCreditoSchema.safeParse({
      cliente_id: 0,
      total_pesos: 85,
      total_dolares: 0,
      items: [itemValido],
    });
    expect(resultado.success).toBe(false);
  });

  it("acepta un caso válido completo", () => {
    const resultado = ventaCreditoSchema.safeParse({
      cliente_id: 1,
      total_pesos: 85,
      total_dolares: 0,
      items: [itemValido],
    });
    expect(resultado.success).toBe(true);
  });
});
