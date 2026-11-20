import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { requireAtm } from '../middleware/auth.js';
import {
  atmLogin, atmSaldo, atmRetiro, atmMovimientos, atmLogout,
} from '../controllers/atm.controller.js';

const router = Router();

router.post(
  '/login',
  [
    body('numeroCuenta').trim().notEmpty().withMessage('Número de cuenta obligatorio.'),
    body('pin').isLength({ min: 4, max: 4 }).isNumeric().withMessage('El PIN debe ser de 4 dígitos.'),
  ],
  validate,
  atmLogin
);

router.get('/saldo', requireAtm, atmSaldo);

router.post(
  '/retiro',
  requireAtm,
  [body('valor').isFloat({ gt: 0 }).withMessage('El valor debe ser mayor que cero.')],
  validate,
  atmRetiro
);

router.get('/movimientos', requireAtm, atmMovimientos);
router.post('/logout', atmLogout);

export default router;
