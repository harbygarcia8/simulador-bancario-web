import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireClient } from '../middleware/auth.js';
import {
  getPerfil, updatePerfil, cambiarPassword, getCuentas, getMovimientos, hacerTransferencia,
} from '../controllers/client.controller.js';

const router = Router();

// Todas las rutas de cliente exigen sesión + rol CLIENTE
router.use(requireAuth, requireClient);

router.get('/perfil', getPerfil);

router.put(
  '/perfil',
  [
    body('telefono').optional({ nullable: true }).isLength({ max: 30 }).withMessage('Teléfono inválido.'),
    body('direccion').optional({ nullable: true }).isLength({ max: 150 }).withMessage('Dirección demasiado larga.'),
  ],
  validate,
  updatePerfil
);

router.put(
  '/password',
  [
    body('passwordActual').notEmpty().withMessage('Ingresa tu contraseña actual.'),
    body('passwordNueva').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres.'),
  ],
  validate,
  cambiarPassword
);

router.get('/cuentas', getCuentas);
router.get('/movimientos', getMovimientos);

router.post(
  '/transferencias',
  [
    body('cuentaOrigenId').isInt({ gt: 0 }).withMessage('Cuenta de origen inválida.'),
    body('numeroCuentaDestino').trim().notEmpty().withMessage('Número de cuenta destino obligatorio.'),
    body('valor').isFloat({ gt: 0 }).withMessage('El valor debe ser mayor que cero.'),
    body('descripcion').optional({ nullable: true }).isLength({ max: 150 }),
  ],
  validate,
  hacerTransferencia
);

export default router;
