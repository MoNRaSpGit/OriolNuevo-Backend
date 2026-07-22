import { armarMovimientos, calcularCaja, calcularGanancia, equivalenteEnPesos } from "./panelCalculos";

describe("equivalenteEnPesos", () => {
  it("suma pesos y dólares convertidos a la tasa fija", () => {
    expect(equivalenteEnPesos({ pesos: 100, dolares: 0 })).toBe(100);
    expect(equivalenteEnPesos({ pesos: 0, dolares: 10 })).toBe(400); // TASA_DOLAR = 40
    expect(equivalenteEnPesos({ pesos: 50, dolares: 5 })).toBe(250);
  });
});

describe("calcularCaja", () => {
  it("es plata inicial + efectivo del día - pagos", () => {
    expect(calcularCaja(100, 200, 50)).toBe(250);
  });

  it("puede dar negativo si los pagos superan lo disponible", () => {
    expect(calcularCaja(0, 50, 100)).toBe(-50);
  });
});

describe("calcularGanancia", () => {
  it("descuenta un 30% de (efectivo - pagos)", () => {
    // 326 (efectivo) - 0 (pagos) = 326 bruto; 326 * 0.7 = 228.2
    expect(calcularGanancia(326, 0)).toBeCloseTo(228.2);
  });

  it("no toma en cuenta tarjeta/crédito, solo el efectivo recibido como parámetro", () => {
    // Si el llamador pasa solo el equivalente de efectivo, tarjeta/crédito
    // quedan afuera del cálculo por diseño (la ganancia real de caja es
    // sobre la plata física, no sobre ventas con tarjeta/crédito).
    const efectivoSolamente = 100;
    expect(calcularGanancia(efectivoSolamente, 0)).toBeCloseTo(70);
  });

  it("resta los pagos antes de aplicar el descuento", () => {
    expect(calcularGanancia(200, 100)).toBeCloseTo(70); // (200-100)*0.7
  });
});

describe("armarMovimientos", () => {
  const fecha1 = new Date("2026-07-22T10:00:00.000Z");
  const fecha2 = new Date("2026-07-22T09:00:00.000Z");

  it("expande el detalle JSON de cada venta en un movimiento por item", () => {
    const ventas = [
      {
        detalle: JSON.stringify([
          { id: 1, name: "Coca Cola", cantidad: 2, precio: 85, currency: "UYU" },
        ]),
        fecha: fecha1,
      },
    ];
    const movimientos = armarMovimientos(ventas, []);
    expect(movimientos).toHaveLength(1);
    expect(movimientos[0]).toMatchObject({
      tipo: "venta",
      descripcion: "Coca Cola",
      cantidad: 2,
      monto: 170,
      currency: "UYU",
    });
  });

  it("agrega los pagos como movimientos propios", () => {
    const pagos = [{ valor: "500", detalle: "Proveedor Coca Cola", fecha: fecha1 }];
    const movimientos = armarMovimientos([], pagos);
    expect(movimientos).toHaveLength(1);
    expect(movimientos[0]).toMatchObject({
      tipo: "pago",
      descripcion: "Proveedor Coca Cola",
      cantidad: null,
      monto: 500,
      currency: null,
    });
  });

  it("ordena todo por fecha descendente (más reciente primero)", () => {
    const ventas = [
      { detalle: JSON.stringify([{ id: 1, name: "Viejo", cantidad: 1, precio: 10, currency: "UYU" }]), fecha: fecha2 },
    ];
    const pagos = [{ valor: "20", detalle: "Nuevo", fecha: fecha1 }];
    const movimientos = armarMovimientos(ventas, pagos);
    expect(movimientos.map((m) => m.descripcion)).toEqual(["Nuevo", "Viejo"]);
  });

  it("no explota si el detalle JSON está corrupto: lo trata como sin items", () => {
    const ventas = [{ detalle: "{esto no es json valido", fecha: fecha1 }];
    const movimientos = armarMovimientos(ventas, []);
    expect(movimientos).toEqual([]);
  });
});
