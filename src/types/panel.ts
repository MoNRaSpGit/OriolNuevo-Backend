export interface TotalPorMoneda {
  pesos: number;
  dolares: number;
}

export interface MovimientoPanel {
  tipo: "venta" | "pago";
  descripcion: string;
  cantidad: number | null;
  monto: number;
  currency: "UYU" | "USD" | null;
  fecha: string;
}

export interface PanelHoy {
  totalTarjeta: TotalPorMoneda;
  totalEfectivo: TotalPorMoneda;
  totalCredito: TotalPorMoneda;
  totalPagos: number;
  cambio: number;
  caja: number;
  ventasDelDia: number;
  ganancias: number;
  movimientos: MovimientoPanel[];
}
