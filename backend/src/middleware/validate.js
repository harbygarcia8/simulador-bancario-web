import { validationResult } from 'express-validator';

/**
 * Middleware que recoge los errores de express-validator y responde 422
 * con un listado claro. Se coloca después de las reglas de validación.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Datos inválidos. Revisa el formulario.',
      errors: errors.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
}
