import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // El SYSTEM time_zone del servidor MySQL no es confiable (no es UTC ni
  // hora de Uruguay). Forzamos UTC en el driver: todo lo que se escribe
  // (via UTC_TIMESTAMP()) y se lee queda en UTC real, sin depender del
  // reloj/tz del host de la BDD.
  timezone: "Z",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
