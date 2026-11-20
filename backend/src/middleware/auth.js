import { pool } from '../config/db.js';

/**
 * Exige una sesión de usuario válida (cliente o administrador).
 * Revalida el estado del usuario en cada petición: si quedó BLOQUEADO o
 * INACTIVO desde otra sesión, se le niega el acceso de inmediato.
 */
export async function requireAuth(req, res, next) {
  try {
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: 'No autenticado. Inicia sesión.' });
    }

    const [rows] = await pool.query(
      'SELECT id, nombre, apellido, email, rol, estado FROM usuarios WHERE id = ? LIMIT 1',
      [req.session.user.id]
    );

    const user = rows[0];
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'Sesión inválida.' });
    }

    if (user.estado !== 'ACTIVO') {
      req.session.destroy(() => {});
      return res.status(403).json({ message: 'Tu cuenta está bloqueada o inactiva. Contacta al banco.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** Exige rol de administrador. */
export function requireAdmin(req, res, next) {
  if (req.user?.rol !== 'ADMIN') {
    return res.status(403).json({ message: 'Acceso restringido a administradores.' });
  }
  next();
}

/** Exige rol de cliente. */
export function requireClient(req, res, next) {
  if (req.user?.rol !== 'CLIENTE') {
    return res.status(403).json({ message: 'Acceso restringido a clientes.' });
  }
  next();
}

/**
 * Exige una sesión de cajero activa (identificación por cuenta + PIN).
 * Es independiente de la sesión web de usuario.
 */
export async function requireAtm(req, res, next) {
  try {
    if (!req.session?.atm?.cuentaId) {
      return res.status(401).json({ message: 'No autenticado en el cajero.' });
    }

    const [rows] = await pool.query(
      'SELECT id, numero_cuenta, estado FROM cuentas WHERE id = ? LIMIT 1',
      [req.session.atm.cuentaId]
    );

    const cuenta = rows[0];
    if (!cuenta || cuenta.estado !== 'ACTIVA') {
      req.session.atm = null;
      return res.status(403).json({ message: 'La cuenta no está activa.' });
    }

    req.atmCuenta = cuenta;
    next();
  } catch (err) {
    next(err);
  }
}
