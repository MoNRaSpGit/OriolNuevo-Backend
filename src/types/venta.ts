export type MetodoPago = "efectivo" | "tarjeta" | "credito";

export interface ItemVenta {
  id: number;
  name: string;
  cantidad: number;
  precio: number;
  currency: "UYU" | "USD";
}

export interface Venta {
  id: number;
  cliente_id: number | null;
  metodo_pago: MetodoPago;
  fecha: string;
  total_pesos: number;
  total_dolares: number;
  detalle: string;
}

export interface VentaCreditoInput {
  cliente_id: number;
  total_pesos: number;
  total_dolares: number;
  items: ItemVenta[];
}

export interface VentaContadoInput {
  metodo_pago: "efectivo" | "tarjeta";
  total_pesos: number;
  total_dolares: number;
  items: ItemVenta[];
}
