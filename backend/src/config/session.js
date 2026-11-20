import session from 'express-session';
import mysqlSessionStore from 'express-mysql-session';
import { config } from './env.js';

const MySQLStore = mysqlSessionStore(session);

/**
 * Almacén de sesiones en MySQL.
 * Así las sesiones sobreviven a reinicios del servidor y no se pierden,
 * y se crea automáticamente la tabla `sessions`.
 */
const store = new MySQLStore({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  createDatabaseTable: true,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000, // 15 min
  expiration: 1000 * 60 * 60 * 8,          // 8 horas
});

/**
 * Middleware de sesión basado en cookies.
 * La cookie es httpOnly (no accesible desde JS del navegador) para mitigar XSS.
 */
export const sessionMiddleware = session({
  name: 'banco.sid',
  secret: config.session.secret,
  store,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: config.isProduction, // requiere HTTPS en producción
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8,  // 8 horas
  },
});
