import { armarResumenMes } from "./mesCalculos";

// Las fechas se guardan en UTC pero representan un momento en Uruguay
// (UTC-3) — para que una venta caiga en el día correcto, la hora UTC de
// prueba se elige holgada (mediodía) para no cruzar el borde del día.
const fechaDia = (anio: number, mes: number, dia: number) => new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0));

describe("armarResumenMes", () => {
  it("arma las 4 semanas de un mes de 30 días, con todos los días en 0 si no hay ventas", () => {
    const resumen = armarResumenMes(2026, 6, []); // junio tiene 30 días
    expect(resumen.semanas).toHaveLength(4);
    expect(resumen.semanas[0].dias).toHaveLength(7); // días 1-7
    expect(resumen.semanas[1].dias).toHaveLength(7); // días 8-14
    expect(resumen.semanas[2].dias).toHaveLength(7); // días 15-21
    expect(resumen.semanas[3].dias).toHaveLength(9); // días 22-30
    expect(resumen.totalPesos).toBe(0);
    expect(resumen.totalDolares).toBe(0);
  });

  it("suma las ventas del día correcto, y el día del mes coincide con el número real", () => {
    const ventas = [
      { fecha: fechaDia(2026, 6, 2), total_pesos: "1000", total_dolares: "0" },
      { fecha: fechaDia(2026, 6, 2), total_pesos: "500", total_dolares: "0" },
    ];
    const resumen = armarResumenMes(2026, 6, ventas);
    const dia2 = resumen.semanas[0].dias.find((d) => d.fecha === "2026-06-02");
    expect(dia2?.totalPesos).toBe(1500);
    expect(dia2?.diaSemana).toBe("martes"); // 2 de junio de 2026 es martes
  });

  it("acumula el total de la semana y del mes", () => {
    const ventas = [
      { fecha: fechaDia(2026, 6, 1), total_pesos: "100", total_dolares: "10" },
      { fecha: fechaDia(2026, 6, 8), total_pesos: "200", total_dolares: "0" },
    ];
    const resumen = armarResumenMes(2026, 6, ventas);
    expect(resumen.semanas[0].totalPesos).toBe(100);
    expect(resumen.semanas[0].totalDolares).toBe(10);
    expect(resumen.semanas[1].totalPesos).toBe(200);
    expect(resumen.totalPesos).toBe(300);
    expect(resumen.totalDolares).toBe(10);
  });

  it("respeta la cantidad de días de un mes de 31 y de febrero", () => {
    const enero = armarResumenMes(2026, 1, []);
    const totalDiasEnero = enero.semanas.reduce((acc, s) => acc + s.dias.length, 0);
    expect(totalDiasEnero).toBe(31);

    const febrero = armarResumenMes(2026, 2, []); // 2026 no es bisiesto
    const totalDiasFebrero = febrero.semanas.reduce((acc, s) => acc + s.dias.length, 0);
    expect(totalDiasFebrero).toBe(28);
  });
});
