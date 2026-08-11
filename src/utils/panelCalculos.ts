import { TASA_DOLAR } from "../config/constants";
import type { ItemVenta } from "../types/venta";
import type { MovimientoPanel, TotalPorMoneda } from "../types/panel";

// El 30% se resta de la ganancia bruta (efectivo del día - pagos a
// proveedores) como estimación de gastos/impuestos, a pedido del
// usuario.
export const PORCENTAJE_GANANCIA_NETA = 0.7;

export function equivalenteEnPesos(total: TotalPorMoneda): number {
  return total.pesos + total.dolares * TASA_DOLAR;
}

export function calcularCaja(cambio: number, efectivoEquivalente: number, totalPagos: number): number {
  return cambio + efectivoEquivalente - totalPagos;
}

// "Ventas del día" y la ganancia se calculan solo con efectivo: es la
// plata que realmente entró a la caja física, a diferencia de
// tarjeta/crédito que no suman al efectivo disponible hoy.
export function calcularGanancia(efectivoEquivalente: number, totalPagos: number): number {
  const gananciaBruta = efectivoEquivalente - totalPagos;
  return gananciaBruta * PORCENTAJE_GANANCIA_NETA;
}

interface FilaVentaDetalle {
  detalle: string;
  fecha: Date;
}

interface FilaPagoDetalle {
  valor: string;
  detalle: string;
  fecha: Date;
}

export function armarMovimientos(
  ventasDetalleRows: FilaVentaDetalle[],
  pagosDetalleRows: FilaPagoDetalle[]
): MovimientoPanel[] {
  const movimientos: MovimientoPanel[] = [];

  for (const venta of ventasDetalleRows) {
    const fechaIso = venta.fecha.toISOString();
    let items: ItemVenta[] = [];
    try {
      items = JSON.parse(venta.detalle);
    } catch {
      items = [];
    }
    for (const item of items) {
      movimientos.push({
        tipo: "venta",
        descripcion: item.name,
        cantidad: item.cantidad,
        monto: item.precio * item.cantidad,
        currency: item.currency,
        fecha: fechaIso,
      });
    }
  }

  for (const pago of pagosDetalleRows) {
    movimientos.push({
      tipo: "pago",
      descripcion: pago.detalle,
      cantidad: null,
      monto: Number(pago.valor),
      currency: null,
      fecha: pago.fecha.toISOString(),
    });
  }

  movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return movimientos;
}
