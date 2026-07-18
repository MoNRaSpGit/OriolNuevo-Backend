export interface Pago {
  id: number;
  valor: number;
  detalle: string;
  fecha: string;
}

export interface PagoInput {
  valor: number;
  detalle: string;
}
