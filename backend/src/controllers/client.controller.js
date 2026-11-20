import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { httpError } from '../middleware/errorHandler.js';
import { transferir } from '../services/operaciones.service.js';

/** GET /api/client/perfil — información personal del cliente. */
export async function getPerfil(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, apellido, tipo_documento, documento, email, telefono, direccion, estado, creado_en
       FROM usuarios WHERE id = ? LIMIT 1`,
      [req.user.id]
    );
    res.json({ perfil: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/client/perfil — el cliente modifica SOLO datos permitidos.
 * No puede tocar saldo, número de cuenta, rol ni estado.
 */
export async function updatePerfil(req, res, next) {
  try {
    const { telefono, direccion } = req.body;
    await pool.query(
      'UPDATE usuarios SET telefono = ?, direccion = ? WHERE id = ?',
      [telefono ?? null, direccion ?? null, req.user.id]
    );
    res.json({ message: 'Perfil actualizado.' });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/client/password — cambio de contraseña con verificación de la actual. */
export async function cambiarPassword(req, res, next) {
  try {
    const { passwordActual, passwordNueva } = req.body;

    const [rows] = await pool.query('SELECT password_hash FROM usuarios WHERE id = ? LIMIT 1', [req.user.id]);
    const ok = await bcrypt.compare(passwordActual, rows[0].password_hash);
    if (!ok) throw httpError(400, 'La contraseña actual no es correcta.');

    const hash = await bcrypt.hash(passwordNueva, 10);
    await pool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [hash, req.user.id]);

    res.json({ message: 'Contraseña actualizada.' });
  } catch (err) {
    next(err);
  }
}

/** GET /api/client/cuentas — cuentas del cliente (número, tipo, saldo, estado). */
export async function getCuentas(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, numero_cuenta, tipo, saldo, estado, creado_en
       FROM cuentas WHERE usuario_id = ? ORDER BY id`,
      [req.user.id]
    );
    res.json({ cuentas: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/client/movimientos — historial de movimientos de TODAS las cuentas del cliente.
 * Soporta ?cuentaId= para filtrar por una cuenta propia.
 */
export async function getMovimientos(req, res, next) {
  try {
    const { cuentaId } = req.query;

    // Solo cuentas del propio cliente
    const [cuentas] = await pool.query('SELECT id FROM cuentas WHERE usuario_id = ?', [req.user.id]);
    const idsPropios = cuentas.map((c) => c.id);
    if (idsPropios.length === 0) return res.json({ movimientos: [] });

    let ids = idsPropios;
    if (cuentaId) {
      const pedido = Number(cuentaId);
      if (!idsPropios.includes(pedido)) {
        throw httpError(403, 'Esa cuenta no te pertenece.');
      }
      ids = [pedido];
    }

    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT m.id, m.cuenta_id, c.numero_cuenta, m.tipo, m.descripcion, m.valor,
              m.saldo_resultante, m.fecha
       FROM movimientos m
       JOIN cuentas c ON c.id = m.cuenta_id
       WHERE m.cuenta_id IN (${placeholders})
       ORDER BY m.fecha DESC, m.id DESC`,
      ids
    );
    res.json({ movimientos: rows });
  } catch (err) {
    next(err);
  }
}

/** POST /api/client/transferencias — transferencia hacia otra cuenta registrada. */
export async function hacerTransferencia(req, res, next) {
  try {
    const { cuentaOrigenId, numeroCuentaDestino, valor, descripcion } = req.body;

    const resultado = await transferir({
      usuarioId: req.user.id,
      cuentaOrigenId: Number(cuentaOrigenId),
      numeroCuentaDestino: String(numeroCuentaDestino).trim(),
      valor,
      descripcion,
    });

    res.json({ message: 'Transferencia realizada con éxito.', ...resultado });
  } catch (err) {
    next(err);
  }
}
