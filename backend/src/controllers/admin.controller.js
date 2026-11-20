import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { httpError } from '../middleware/errorHandler.js';
import { consignar } from '../services/operaciones.service.js';

/** Genera un número de cuenta de 10 dígitos. */
function generarNumeroCuenta() {
  return String(Math.floor(1_000_000_000 + Math.random() * 8_999_999_999));
}

/** GET /api/admin/dashboard — métricas generales del banco. */
export async function getDashboard(req, res, next) {
  try {
    const [[clientes]] = await pool.query(
      "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'CLIENTE'"
    );
    const [[activos]] = await pool.query(
      "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'CLIENTE' AND estado = 'ACTIVO'"
    );
    const [[bloqueados]] = await pool.query(
      "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'CLIENTE' AND estado = 'BLOQUEADO'"
    );
    const [[cuentasActivas]] = await pool.query(
      "SELECT COUNT(*) AS total FROM cuentas WHERE estado = 'ACTIVA'"
    );
    const [[saldos]] = await pool.query('SELECT COALESCE(SUM(saldo), 0) AS total FROM cuentas');

    res.json({
      totalClientes: clientes.total,
      clientesActivos: activos.total,
      clientesBloqueados: bloqueados.total,
      cuentasActivas: cuentasActivas.total,
      sumaSaldos: saldos.total,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/clientes — crea un cliente con una cuenta asociada.
 * Transaccional: usuario + cuenta (+ movimiento de saldo inicial si aplica).
 */
export async function crearCliente(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const {
      nombre, apellido, tipoDocumento, documento, email, telefono, direccion,
      password, tipoCuenta = 'AHORROS', pin, saldoInicial = 0,
    } = req.body;

    await conn.beginTransaction();

    // Unicidad de email y documento
    const [dup] = await conn.query(
      'SELECT id FROM usuarios WHERE email = ? OR documento = ? LIMIT 1',
      [email, documento]
    );
    if (dup.length) throw httpError(409, 'Ya existe un usuario con ese email o documento.');

    const passwordHash = await bcrypt.hash(password, 10);
    const [u] = await conn.query(
      `INSERT INTO usuarios (nombre, apellido, tipo_documento, documento, email, telefono, direccion, password_hash, rol, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CLIENTE', 'ACTIVO')`,
      [nombre, apellido, tipoDocumento, documento, email, telefono ?? null, direccion ?? null, passwordHash]
    );
    const usuarioId = u.insertId;

    // Número de cuenta único (reintenta ante colisión)
    let numeroCuenta;
    for (let intento = 0; intento < 5; intento++) {
      numeroCuenta = generarNumeroCuenta();
      const [existe] = await conn.query('SELECT id FROM cuentas WHERE numero_cuenta = ?', [numeroCuenta]);
      if (!existe.length) break;
      if (intento === 4) throw httpError(500, 'No se pudo generar un número de cuenta único.');
    }

    const pinHash = await bcrypt.hash(String(pin), 10);
    const saldo = Math.round(Number(saldoInicial) * 100) / 100 || 0;

    const [c] = await conn.query(
      `INSERT INTO cuentas (usuario_id, numero_cuenta, tipo, saldo, pin_hash, estado)
       VALUES (?, ?, ?, ?, ?, 'ACTIVA')`,
      [usuarioId, numeroCuenta, tipoCuenta, saldo, pinHash]
    );

    if (saldo > 0) {
      await conn.query(
        `INSERT INTO movimientos (cuenta_id, tipo, descripcion, valor, saldo_resultante)
         VALUES (?, 'CONSIGNACION', 'Saldo inicial de apertura', ?, ?)`,
        [c.insertId, saldo, saldo]
      );
    }

    await conn.commit();
    res.status(201).json({
      message: 'Cliente creado con éxito.',
      cliente: { id: usuarioId, numeroCuenta },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/** GET /api/admin/clientes — lista/busca clientes (?q= por nombre, documento o email). */
export async function listarClientes(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    let sql = `SELECT id, nombre, apellido, tipo_documento, documento, email, telefono, estado, creado_en
               FROM usuarios WHERE rol = 'CLIENTE'`;
    const params = [];
    if (q) {
      sql += ' AND (nombre LIKE ? OR apellido LIKE ? OR documento LIKE ? OR email LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    sql += ' ORDER BY creado_en DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ clientes: rows });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/clientes/:id — detalle del cliente con sus cuentas. */
export async function detalleCliente(req, res, next) {
  try {
    const { id } = req.params;
    const [uRows] = await pool.query(
      `SELECT id, nombre, apellido, tipo_documento, documento, email, telefono, direccion, estado, creado_en
       FROM usuarios WHERE id = ? AND rol = 'CLIENTE' LIMIT 1`,
      [id]
    );
    if (!uRows.length) throw httpError(404, 'Cliente no encontrado.');

    const [cuentas] = await pool.query(
      'SELECT id, numero_cuenta, tipo, saldo, estado, creado_en FROM cuentas WHERE usuario_id = ? ORDER BY id',
      [id]
    );
    res.json({ cliente: uRows[0], cuentas });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/clientes/:id — edita datos permitidos del cliente. */
export async function editarCliente(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, direccion } = req.body;

    const [exists] = await pool.query("SELECT id FROM usuarios WHERE id = ? AND rol = 'CLIENTE'", [id]);
    if (!exists.length) throw httpError(404, 'Cliente no encontrado.');

    // Email único entre otros usuarios
    const [dup] = await pool.query('SELECT id FROM usuarios WHERE email = ? AND id <> ?', [email, id]);
    if (dup.length) throw httpError(409, 'Ese email ya está en uso por otro usuario.');

    await pool.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?',
      [nombre, apellido, email, telefono ?? null, direccion ?? null, id]
    );
    res.json({ message: 'Cliente actualizado.' });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/admin/clientes/:id/estado — habilita o bloquea al cliente (y sus cuentas). */
export async function cambiarEstadoCliente(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { estado } = req.body; // ACTIVO | BLOQUEADO | INACTIVO

    await conn.beginTransaction();
    const [exists] = await conn.query("SELECT id FROM usuarios WHERE id = ? AND rol = 'CLIENTE'", [id]);
    if (!exists.length) throw httpError(404, 'Cliente no encontrado.');

    await conn.query('UPDATE usuarios SET estado = ? WHERE id = ?', [estado, id]);

    // Sincroniza el estado de las cuentas del cliente
    const estadoCuenta = estado === 'ACTIVO' ? 'ACTIVA' : estado === 'BLOQUEADO' ? 'BLOQUEADA' : 'INACTIVA';
    await conn.query('UPDATE cuentas SET estado = ? WHERE usuario_id = ?', [estadoCuenta, id]);

    await conn.commit();
    res.json({ message: `Cliente ${estado === 'ACTIVO' ? 'habilitado' : 'bloqueado'}.`, estado });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/** GET /api/admin/cuentas — todas las cuentas con su titular y saldo. */
export async function listarCuentas(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.numero_cuenta, c.tipo, c.saldo, c.estado,
              u.id AS usuario_id, u.nombre, u.apellido, u.documento
       FROM cuentas c
       JOIN usuarios u ON u.id = c.usuario_id
       ORDER BY c.id`
    );
    res.json({ cuentas: rows });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/consignaciones — consignación a una cuenta. */
export async function hacerConsignacion(req, res, next) {
  try {
    const { cuentaId, valor, descripcion } = req.body;
    const resultado = await consignar({
      cuentaId: Number(cuentaId),
      valor,
      descripcion: descripcion?.trim() || 'Consignación en caja',
    });
    res.json({ message: 'Consignación realizada con éxito.', ...resultado });
  } catch (err) {
    next(err);
  }
}

/** GET /api/admin/movimientos — historial general de movimientos (con titular). */
export async function movimientosGenerales(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const [rows] = await pool.query(
      `SELECT m.id, m.tipo, m.descripcion, m.valor, m.saldo_resultante, m.fecha,
              c.numero_cuenta, u.nombre, u.apellido
       FROM movimientos m
       JOIN cuentas c ON c.id = m.cuenta_id
       JOIN usuarios u ON u.id = c.usuario_id
       ORDER BY m.fecha DESC, m.id DESC
       LIMIT ?`,
      [limit]
    );
    res.json({ movimientos: rows });
  } catch (err) {
    next(err);
  }
}
