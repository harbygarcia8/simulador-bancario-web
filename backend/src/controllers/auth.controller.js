import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

/**
 * POST /api/auth/login
 * Inicia sesión de cliente o administrador con email + contraseña.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT id, nombre, apellido, email, password_hash, rol, estado FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows[0];

    // Mensaje genérico para no revelar si el email existe (evita enumeración de usuarios)
    const credencialesInvalidas = () =>
      res.status(401).json({ message: 'Email o contraseña incorrectos.' });

    if (!user) return credencialesInvalidas();

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return credencialesInvalidas();

    if (user.estado !== 'ACTIVO') {
      return res.status(403).json({ message: 'Tu cuenta está bloqueada o inactiva. Contacta al banco.' });
    }

    // Guarda lo mínimo en la sesión
    req.session.user = { id: user.id, rol: user.rol };

    res.json({
      message: 'Sesión iniciada.',
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Devuelve el usuario autenticado (requiere sesión).
 */
export async function me(req, res) {
  res.json({
    user: {
      id: req.user.id,
      nombre: req.user.nombre,
      apellido: req.user.apellido,
      email: req.user.email,
      rol: req.user.rol,
    },
  });
}

/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario web.
 */
export async function logout(req, res) {
  if (req.session) {
    req.session.user = null;
  }
  res.json({ message: 'Sesión cerrada.' });
}
