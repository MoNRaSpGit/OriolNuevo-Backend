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
