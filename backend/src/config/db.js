import mysql from 'mysql2/promise';
import { config } from './env.js';

/**
 * Pool de conexiones MySQL.
 * Usamos consultas parametrizadas (placeholders ?) en TODO el proyecto
 * para prevenir inyección SQL (OWASP A03:2021).
 */
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Mantiene DECIMAL como string para no perder precisión en dinero.
  decimalNumbers: false,
  timezone: 'Z',
});

/**
 * Verifica que la conexión a la base de datos funcione al arrancar.
 */
export async function assertDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log(`[db] ✅ Conectado a MySQL "${config.db.database}" en ${config.db.host}:${config.db.port}`);
  } finally {
    connection.release();
  }
}
