import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración central de la aplicación, leída desde variables de entorno.
 * Nunca se escriben credenciales en el código: todo viene del archivo .env
 */
export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'simulador_bancario',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'cambia-esta-clave',
  },
};

// Validación mínima de configuración crítica al arrancar.
if (!process.env.SESSION_SECRET) {
  console.warn('[config] ⚠️  SESSION_SECRET no está definido en .env; usando valor por defecto (NO usar en producción).');
}
