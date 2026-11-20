import { pool } from '../config/db.js';
import { httpError } from '../middleware/errorHandler.js';

/**
 * Lógica de negocio del dinero. TODAS las operaciones:
 *  - corren dentro de una transacción (BEGIN/COMMIT/ROLLBACK),
 *  - bloquean la(s) fila(s) de cuenta con SELECT ... FOR UPDATE,
 *  - hacen la aritmética del saldo EN SQL (nunca con floats de JS),
 *  - registran SIEMPRE el/los movimiento(s) correspondiente(s).
 */

function aMonto(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n) || n <= 0) {
    throw httpError(400, 'El valor debe ser un número mayor que cero.');
  }
  // Normaliza a 2 decimales
  return Math.round(n * 100) / 100;
}

/**
 * RETIRO (usado por el cajero).
 * Reglas: la cuenta debe existir, estar ACTIVA, el valor > 0 y haber saldo suficiente.
 */
export async function retirar({ cuentaId, valor, descripcion = 'Retiro en cajero' }) {
  const monto = aMonto(valor);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT id, estado, saldo FROM cuentas WHERE id = ? FOR UPDATE',
      [cuentaId]
    );
    const cuenta = rows[0];
    if (!cuenta) throw httpError(404, 'La cuenta no existe.');
    if (cuenta.estado !== 'ACTIVA') throw httpError(403, 'La cuenta no está activa.');
    if (Number(cuenta.saldo) < monto) throw httpError(400, 'Saldo insuficiente.');

    await conn.query('UPDATE cuentas SET saldo = saldo - ? WHERE id = ?', [monto, cuentaId]);

    const [[{ saldo: nuevoSaldo }]] = await conn.query(
      'SELECT saldo FROM cuentas WHERE id = ?',
      [cuentaId]
    );

    const [mov] = await conn.query(
      `INSERT INTO movimientos (cuenta_id, tipo, descripcion, valor, saldo_resultante)
       VALUES (?, 'RETIRO', ?, ?, ?)`,
      [cuentaId, descripcion, -monto, nuevoSaldo]
    );

    await conn.commit();
    return { saldo: nuevoSaldo, movimientoId: mov.insertId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * CONSIGNACIÓN (usada por el administrador).
 * Reglas: la cuenta debe existir, estar ACTIVA y el valor > 0.
 */
export async function consignar({ cuentaId, valor, descripcion = 'Consignación' }) {
  const monto = aMonto(valor);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT id, estado FROM cuentas WHERE id = ? FOR UPDATE',
      [cuentaId]
    );
    const cuenta = rows[0];
    if (!cuenta) throw httpError(404, 'La cuenta no existe.');
    if (cuenta.estado !== 'ACTIVA') throw httpError(403, 'La cuenta no está activa.');

    await conn.query('UPDATE cuentas SET saldo = saldo + ? WHERE id = ?', [monto, cuentaId]);

    const [[{ saldo: nuevoSaldo }]] = await conn.query(
      'SELECT saldo FROM cuentas WHERE id = ?',
      [cuentaId]
    );

    const [mov] = await conn.query(
      `INSERT INTO movimientos (cuenta_id, tipo, descripcion, valor, saldo_resultante)
       VALUES (?, 'CONSIGNACION', ?, ?, ?)`,
      [cuentaId, descripcion, monto, nuevoSaldo]
    );

    await conn.commit();
    return { saldo: nuevoSaldo, movimientoId: mov.insertId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * TRANSFERENCIA (usada por el cliente en la banca virtual).
 * Reglas: cuentas origen y destino existen, ambas ACTIVAS, valor > 0,
 * saldo suficiente en origen, y la cuenta origen pertenece al cliente.
 * Registra DOS movimientos (enviado y recibido) y una fila en `transferencias`.
 */
export async function transferir({ usuarioId, cuentaOrigenId, numeroCuentaDestino, valor, descripcion }) {
  const monto = aMonto(valor);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Cuenta origen: existe, es ACTIVA y pertenece al usuario
    const [origenRows] = await conn.query(
      'SELECT id, usuario_id, numero_cuenta, estado, saldo FROM cuentas WHERE id = ? FOR UPDATE',
      [cuentaOrigenId]
    );
    const origen = origenRows[0];
    if (!origen) throw httpError(404, 'La cuenta de origen no existe.');
    if (origen.usuario_id !== usuarioId) throw httpError(403, 'La cuenta de origen no te pertenece.');
    if (origen.estado !== 'ACTIVA') throw httpError(403, 'Tu cuenta no está activa.');

    // 2. Cuenta destino por número
    const [destinoRows] = await conn.query(
      'SELECT id, numero_cuenta, estado FROM cuentas WHERE numero_cuenta = ? FOR UPDATE',
      [numeroCuentaDestino]
    );
    const destino = destinoRows[0];
    if (!destino) throw httpError(404, 'La cuenta de destino no existe.');
    if (destino.id === origen.id) throw httpError(400, 'No puedes transferir a la misma cuenta.');
    if (destino.estado !== 'ACTIVA') throw httpError(403, 'La cuenta de destino no está activa.');

    // 3. Saldo suficiente
    if (Number(origen.saldo) < monto) throw httpError(400, 'Saldo insuficiente para la transferencia.');

    // 4. Mover el dinero
    await conn.query('UPDATE cuentas SET saldo = saldo - ? WHERE id = ?', [monto, origen.id]);
    await conn.query('UPDATE cuentas SET saldo = saldo + ? WHERE id = ?', [monto, destino.id]);

    const [[{ saldo: saldoOrigen }]] = await conn.query('SELECT saldo FROM cuentas WHERE id = ?', [origen.id]);
    const [[{ saldo: saldoDestino }]] = await conn.query('SELECT saldo FROM cuentas WHERE id = ?', [destino.id]);

    // 5. Dos movimientos
    const descEnviada = descripcion?.trim() || `Transferencia a ${destino.numero_cuenta}`;
    const descRecibida = descripcion?.trim() || `Transferencia de ${origen.numero_cuenta}`;

    await conn.query(
      `INSERT INTO movimientos (cuenta_id, tipo, descripcion, valor, saldo_resultante, cuenta_relacionada_id)
       VALUES (?, 'TRANSFERENCIA_ENVIADA', ?, ?, ?, ?)`,
      [origen.id, descEnviada, -monto, saldoOrigen, destino.id]
    );
    await conn.query(
      `INSERT INTO movimientos (cuenta_id, tipo, descripcion, valor, saldo_resultante, cuenta_relacionada_id)
       VALUES (?, 'TRANSFERENCIA_RECIBIDA', ?, ?, ?, ?)`,
      [destino.id, descRecibida, monto, saldoDestino, origen.id]
    );

    // 6. Registro en la tabla de transferencias
    await conn.query(
      `INSERT INTO transferencias (cuenta_origen_id, cuenta_destino_id, valor, descripcion)
       VALUES (?, ?, ?, ?)`,
      [origen.id, destino.id, monto, descEnviada]
    );

    await conn.commit();
    return {
      saldoOrigen,
      cuentaDestino: destino.numero_cuenta,
      valor: monto,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
