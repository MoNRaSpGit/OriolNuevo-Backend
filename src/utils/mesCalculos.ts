import { fechaUyYMD } from "./fechas";

const NOMBRES_DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export interface DiaMes {
  fecha: string; // YYYY-MM-DD
  diaSemana: string;
  totalPesos: number;
  totalDolares: number;
}

export interface SemanaMes {
  numero: number;
  dias: DiaMes[];
  totalPesos: number;
  totalDolares: number;
}

export interface ResumenMes {
  anio: number;
  mes: number;
  semanas: SemanaMes[];
  totalPesos: number;
  totalDolares: number;
}

interface FilaVentaMes {
  fecha: Date;
  total_pesos: string | number;
  total_dolares: string | number;
}

// Semana 1 = días 1-7, semana 2 = 8-14, semana 3 = 15-21, semana 4 =
// 22 en adelante (incluye los días extra de meses de 30/31). Simple y
// predecible, no hace falta alinear a semanas calendario (lunes a
// domingo) para que el negocio pueda seguir el mes de un vistazo.
export function armarResumenMes(anio: number, mes: number, ventas: FilaVentaMes[]): ResumenMes {
  const diasEnMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate();

  const totalesPorDia = new Map<string, { pesos: number; dolares: number }>();
  for (const venta of ventas) {
    const clave = fechaUyYMD(venta.fecha);
    const actual = totalesPorDia.get(clave) ?? { pesos: 0, dolares: 0 };
    actual.pesos += Number(venta.total_pesos) || 0;
    actual.dolares += Number(venta.total_dolares) || 0;
    totalesPorDia.set(clave, actual);
  }

  const semanas: SemanaMes[] = [];
  let semanaActual: SemanaMes | null = null;

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const numeroSemana = Math.min(4, Math.ceil(dia / 7));
    if (!semanaActual || semanaActual.numero !== numeroSemana) {
      semanaActual = { numero: numeroSemana, dias: [], totalPesos: 0, totalDolares: 0 };
      semanas.push(semanaActual);
    }

    const fecha = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const totalesDia = totalesPorDia.get(fecha) ?? { pesos: 0, dolares: 0 };
    const diaSemana = NOMBRES_DIA[new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()];

    semanaActual.dias.push({
      fecha,
      diaSemana,
      totalPesos: totalesDia.pesos,
      totalDolares: totalesDia.dolares,
    });
    semanaActual.totalPesos += totalesDia.pesos;
    semanaActual.totalDolares += totalesDia.dolares;
  }

  const totalPesos = semanas.reduce((acc, s) => acc + s.totalPesos, 0);
  const totalDolares = semanas.reduce((acc, s) => acc + s.totalDolares, 0);

  return { anio, mes, semanas, totalPesos, totalDolares };
}
