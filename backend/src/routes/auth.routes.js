import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { login, logout, me } from '../controllers/auth.controller.js';

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  ],
  validate,
  login
);

router.get('/me', requireAuth, me);
router.post('/logout', logout);

export default router;
