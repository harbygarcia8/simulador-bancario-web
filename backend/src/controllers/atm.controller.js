import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { retirar } from '../services/operaciones.service.js';

/**
 * POST /api/atm/login — identificación en el cajero por número de cuenta + PIN.
 * Crea una sesión de cajero independiente de la sesión web.
 */
export async function atmLogin(req, res, next) {
  try {
    const { numeroCuenta, pin } = req.body;

    const [rows] = await pool.query(
      `SELECT c.id, c.numero_cuenta, c.tipo, c.estado, c.pin_hash, u.nombre, u.apellido
       FROM cuentas c JOIN usuarios u ON u.id = c.usuario_id
       WHERE c.numero_cuenta = ? LIMIT 1`,
      [String(numeroCuenta).trim()]
    );
    const cuenta = rows[0];

    const invalido = () => res.status(401).json({ message: 'Número de cuenta o PIN incorrectos.' });
    if (!cuenta) return invalido();

    const ok = await bcrypt.compare(String(pin), cuenta.pin_hash);
    if (!ok) return invalido();

    if (cuenta.estado !== 'ACTIVA') {
      return res.status(403).json({ message: 'La cuenta no está activa.' });
    }

    req.session.atm = { cuentaId: cuenta.id, numeroCuenta: cuenta.numero_cuenta };

    res.json({
      message: 'Bienvenido al cajero.',
      cuenta: {
        numeroCuenta: cuenta.numero_cuenta,
        tipo: cuenta.tipo,
        titular: `${cuenta.nombre} ${cuenta.apellido}`,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/atm/saldo — saldo de la cuenta en sesión de cajero. */
export async function atmSaldo(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT c.numero_cuenta, c.tipo, c.saldo, u.nombre, u.apellido
       FROM cuentas c JOIN usuarios u ON u.id = c.usuario_id
       WHERE c.id = ? LIMIT 1`,
      [req.atmCuenta.id]
    );
    const c = rows[0];
    res.json({
      numeroCuenta: c.numero_cuenta,
      tipo: c.tipo,
      saldo: c.saldo,
      titular: `${c.nombre} ${c.apellido}`,
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/atm/retiro — retiro de efectivo. */
export async function atmRetiro(req, res, next) {
  try {
    const { valor } = req.body;
    const resultado = await retirar({
      cuentaId: req.atmCuenta.id,
      valor,
      descripcion: 'Retiro en cajero',
    });
    res.json({ message: 'Retiro exitoso.', saldo: resultado.saldo });
  } catch (err) {
    next(err);
  }
}

/** GET /api/atm/movimientos — últimos movimientos de la cuenta en el cajero. */
export async function atmMovimientos(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, tipo, descripcion, valor, saldo_resultante, fecha
       FROM movimientos WHERE cuenta_id = ?
       ORDER BY fecha DESC, id DESC LIMIT 10`,
      [req.atmCuenta.id]
    );
    res.json({ movimientos: rows });
  } catch (err) {
    next(err);
  }
}

/** POST /api/atm/logout — cierra la operación del cajero. */
export async function atmLogout(req, res) {
  if (req.session) req.session.atm = null;
  res.json({ message: 'Operación finalizada.' });
}
