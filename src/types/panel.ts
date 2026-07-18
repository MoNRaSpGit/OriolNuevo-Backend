export interface TotalPorMoneda {
  pesos: number;
  dolares: number;
}

export interface PanelHoy {
  totalTarjeta: TotalPorMoneda;
  totalEfectivo: TotalPorMoneda;
  totalCredito: TotalPorMoneda;
  totalPagos: number;
  cambio: number;
  caja: number;
}
