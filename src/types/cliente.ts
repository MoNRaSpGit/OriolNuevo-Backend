export interface Cliente {
  id: number;
  nombre: string;
  telefono: string | null;
  deuda: string; // DECIMAL de MySQL: mysql2 lo devuelve como string, no como number
  created_at: string;
}

export interface ClienteInput {
  nombre: string;
  telefono?: string;
}
