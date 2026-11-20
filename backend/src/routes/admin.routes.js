import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  getDashboard, crearCliente, listarClientes, detalleCliente, editarCliente,
  cambiarEstadoCliente, listarCuentas, hacerConsignacion, movimientosGenerales,
} from '../controllers/admin.controller.js';

const router = Router();

// Todas las rutas de admin exigen sesión + rol ADMIN
router.use(requireAuth, requireAdmin);

router.get('/dashboard', getDashboard);

router.post(
  '/clientes',
  [
    body('nombre').trim().notEmpty().withMessage('Nombre obligatorio.'),
    body('apellido').trim().notEmpty().withMessage('Apellido obligatorio.'),
    body('tipoDocumento').isIn(['CC', 'CE', 'TI', 'PASAPORTE']).withMessage('Tipo de documento inválido.'),
    body('documento').trim().isLength({ min: 4, max: 20 }).withMessage('Documento inválido.'),
    body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    body('pin').isLength({ min: 4, max: 4 }).isNumeric().withMessage('El PIN debe ser de 4 dígitos.'),
    body('tipoCuenta').optional().isIn(['AHORROS', 'CORRIENTE']).withMessage('Tipo de cuenta inválido.'),
    body('saldoInicial').optional().isFloat({ min: 0 }).withMessage('Saldo inicial inválido.'),
    body('telefono').optional({ nullable: true }).isLength({ max: 30 }),
    body('direccion').optional({ nullable: true }).isLength({ max: 150 }),
  ],
  validate,
  crearCliente
);

router.get('/clientes', listarClientes);

router.get(
  '/clientes/:id',
  [param('id').isInt({ gt: 0 })],
  validate,
  detalleCliente
);

router.put(
  '/clientes/:id',
  [
    param('id').isInt({ gt: 0 }),
    body('nombre').trim().notEmpty().withMessage('Nombre obligatorio.'),
    body('apellido').trim().notEmpty().withMessage('Apellido obligatorio.'),
    body('email').isEmail().withMessage('Email inválido.').normalizeEmail(),
    body('telefono').optional({ nullable: true }).isLength({ max: 30 }),
    body('direccion').optional({ nullable: true }).isLength({ max: 150 }),
  ],
  validate,
  editarCliente
);

router.patch(
  '/clientes/:id/estado',
  [
    param('id').isInt({ gt: 0 }),
    body('estado').isIn(['ACTIVO', 'BLOQUEADO', 'INACTIVO']).withMessage('Estado inválido.'),
  ],
  validate,
  cambiarEstadoCliente
);

router.get('/cuentas', listarCuentas);

router.post(
  '/consignaciones',
  [
    body('cuentaId').isInt({ gt: 0 }).withMessage('Cuenta inválida.'),
    body('valor').isFloat({ gt: 0 }).withMessage('El valor debe ser mayor que cero.'),
    body('descripcion').optional({ nullable: true }).isLength({ max: 150 }),
  ],
  validate,
  hacerConsignacion
);

router.get('/movimientos', movimientosGenerales);

export default router;
