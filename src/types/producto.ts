export interface Producto {
  id: number;
  name: string;
  price: number;
  description: string | null;
  currency: string;
  codigo_barra: string | null;
  stock: number;
}

export interface ProductoInput {
  name: string;
  price: number;
  description?: string;
  currency: string;
  codigo_barra?: string;
  stock?: number;
}
