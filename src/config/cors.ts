import type { CorsOptions } from "cors";

const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Cualquier localhost:PUERTO se permite siempre: en desarrollo, Vite puede
// levantar el front en 5173/5174/5175/... si el puerto por defecto ya esta
// ocupado, y no tiene sentido mantener una lista manual de puertos locales.
// No es un riesgo de seguridad real: un origen localhost solo lo puede
// generar algo que ya corre en la propia maquina del usuario.
const ES_LOCALHOST = /^https?:\/\/localhost:\d+$/;

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Sin origin = requests server-to-server (curl, health checks de Render, etc.)
    if (!origin || allowedOrigins.includes(origin) || ES_LOCALHOST.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
};
