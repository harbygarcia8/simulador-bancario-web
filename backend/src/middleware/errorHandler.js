import { config } from '../config/env.js';

/** Ruta no encontrada. */
export function notFound(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

/**
 * Manejador central de errores. Registra el error en el servidor y
 * nunca filtra detalles internos al cliente en producción.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  // Error controlado con status personalizado
  const status = err.status || 500;
  const message =
    status === 500 && config.isProduction
      ? 'Ocurrió un error interno. Intenta más tarde.'
      : err.message || 'Error interno del servidor.';

  res.status(status).json({ message });
}

/** Helper para lanzar errores con código HTTP. */
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
