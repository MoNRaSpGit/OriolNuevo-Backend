export interface Cliente {
  id: number;
  nombre: string;
  telefono: string | null;
  deuda: number;
  created_at: string;
}

export interface ClienteInput {
  nombre: string;
  telefono?: string;
}

export interface ItemVenta {
  id: number;
  name: string;
  cantidad: number;
  precio: number;
  currency: "UYU" | "USD";
}

export interface VentaContadoInput {
  items: ItemVenta[];
}

export interface VentaCredito {
  id: number;
  cliente_id: number;
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
