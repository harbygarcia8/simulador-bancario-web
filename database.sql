-- ============================================================================
--  SIMULADOR BANCARIO WEB — Script de base de datos
--  Motor: MySQL 8.0+  (InnoDB para claves foráneas y transacciones)
--
--  Crea: base de datos, tablas, relaciones, llaves y datos de prueba.
--  La tabla `sessions` (almacén de sesiones) la crea automáticamente el
--  backend al arrancar (express-mysql-session); no es necesario crearla aquí.
--
--  Uso:  mysql -u root -p < database.sql
-- ============================================================================

DROP DATABASE IF EXISTS simulador_bancario;
CREATE DATABASE simulador_bancario
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE simulador_bancario;

-- ----------------------------------------------------------------------------
-- Tabla: usuarios  (clientes y administradores)
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(80)  NOT NULL,
  apellido        VARCHAR(80)  NOT NULL,
  tipo_documento  ENUM('CC','CE','TI','PASAPORTE') NOT NULL DEFAULT 'CC',
  documento       VARCHAR(20)  NOT NULL,
  email           VARCHAR(120) NOT NULL,
  telefono        VARCHAR(30)  NULL,
  direccion       VARCHAR(150) NULL,
  password_hash   VARCHAR(100) NOT NULL,                       -- bcrypt, nunca texto plano
  rol             ENUM('CLIENTE','ADMIN') NOT NULL DEFAULT 'CLIENTE',
  estado          ENUM('ACTIVO','INACTIVO','BLOQUEADO') NOT NULL DEFAULT 'ACTIVO',
  creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuarios_documento UNIQUE (documento),
  CONSTRAINT uq_usuarios_email     UNIQUE (email)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Tabla: cuentas  (cuentas bancarias de los clientes)
-- ----------------------------------------------------------------------------
CREATE TABLE cuentas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  numero_cuenta   VARCHAR(20) NOT NULL,
  tipo            ENUM('AHORROS','CORRIENTE') NOT NULL DEFAULT 'AHORROS',
  saldo           DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  pin_hash        VARCHAR(100) NOT NULL,                       -- PIN del cajero, hasheado
  estado          ENUM('ACTIVA','INACTIVA','BLOQUEADA') NOT NULL DEFAULT 'ACTIVA',
  creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_cuentas_numero UNIQUE (numero_cuenta),
  CONSTRAINT fk_cuentas_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_cuentas_saldo CHECK (saldo >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_cuentas_usuario ON cuentas(usuario_id);

-- ----------------------------------------------------------------------------
-- Tabla: movimientos  (historial financiero; NO se elimina desde el sistema)
--   valor: positivo = ingreso (consignación / transferencia recibida)
--          negativo = egreso  (retiro / transferencia enviada)
-- ----------------------------------------------------------------------------
CREATE TABLE movimientos (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  cuenta_id               INT NOT NULL,
  tipo                    ENUM('CONSIGNACION','RETIRO','TRANSFERENCIA_ENVIADA','TRANSFERENCIA_RECIBIDA') NOT NULL,
  descripcion             VARCHAR(150) NULL,
  valor                   DECIMAL(15,2) NOT NULL,
  saldo_resultante        DECIMAL(15,2) NOT NULL,
  cuenta_relacionada_id   INT NULL,                            -- la otra cuenta en una transferencia
  fecha                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_cuenta FOREIGN KEY (cuenta_id)
    REFERENCES cuentas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_mov_cuenta_rel FOREIGN KEY (cuenta_relacionada_id)
    REFERENCES cuentas(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_mov_cuenta_fecha ON movimientos(cuenta_id, fecha);

-- ----------------------------------------------------------------------------
-- Tabla: transferencias  (registro específico de transferencias)
-- ----------------------------------------------------------------------------
CREATE TABLE transferencias (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  cuenta_origen_id   INT NOT NULL,
  cuenta_destino_id  INT NOT NULL,
  valor              DECIMAL(15,2) NOT NULL,
  descripcion        VARCHAR(150) NULL,
  fecha              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tr_origen  FOREIGN KEY (cuenta_origen_id)
    REFERENCES cuentas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_tr_destino FOREIGN KEY (cuenta_destino_id)
    REFERENCES cuentas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_tr_valor CHECK (valor > 0)
) ENGINE=InnoDB;

-- ============================================================================
--  DATOS DE PRUEBA
--  Contraseñas (bcrypt):  admin -> Admin123   |   clientes -> Cliente123
--  PIN cajero:  Ana=1234   Carlos=5678   Diana=4321
-- ============================================================================

-- 1 administrador + 3 clientes
INSERT INTO usuarios (id, nombre, apellido, tipo_documento, documento, email, telefono, direccion, password_hash, rol, estado) VALUES
  (1, 'Administrador', 'del Banco', 'CC', '0000000000', 'admin@banco.com', '6010000000', 'Sede Principal',
      '$2a$10$mRQmVq5py8PzbJeF3pk7T.DEJpfLZKINSFt71JpdtZQqlQaugF4hy', 'ADMIN', 'ACTIVO'),
  (2, 'Ana',    'Gómez',  'CC', '1001001001', 'ana@banco.com',    '3001112233', 'Calle 1 # 2-3, Bogotá',
      '$2a$10$0UmIikOji.KypBINFyKYnOZHxcfbsMJbjU6wC9ekRBTku.GTdY6QG', 'CLIENTE', 'ACTIVO'),
  (3, 'Carlos', 'Ruiz',   'CC', '1002002002', 'carlos@banco.com', '3004445566', 'Carrera 4 # 5-6, Medellín',
      '$2a$10$0UmIikOji.KypBINFyKYnOZHxcfbsMJbjU6wC9ekRBTku.GTdY6QG', 'CLIENTE', 'ACTIVO'),
  (4, 'Diana',  'Torres', 'CC', '1003003003', 'diana@banco.com',  '3007778899', 'Avenida 7 # 8-9, Cali',
      '$2a$10$0UmIikOji.KypBINFyKYnOZHxcfbsMJbjU6wC9ekRBTku.GTdY6QG', 'CLIENTE', 'ACTIVO');

-- Cuentas (saldos diferentes)
INSERT INTO cuentas (id, usuario_id, numero_cuenta, tipo, saldo, pin_hash, estado) VALUES
  (1, 2, '1000000001', 'AHORROS',   1000000.00, '$2a$10$ZK.QINM7Rf4NBMjwXcyDheE7659fHICW1lBtO.lXcZnSm56058cfG', 'ACTIVA'),
  (2, 3, '1000000002', 'AHORROS',    500000.00, '$2a$10$Yu8g6qYhoWPCAP9hRWN7hubwBzus3JaI2pOJ.wzgnYDzGtzbp.oAi', 'ACTIVA'),
  (3, 4, '1000000003', 'CORRIENTE', 2500000.00, '$2a$10$jpYrvP5U3Lexks8TjwKlVOdjxTikBs1UXhPIRicgNJAmeSzwu/qlO', 'ACTIVA');

-- Movimientos iniciales (saldo_resultante coherente con el saldo final de cada cuenta)
INSERT INTO movimientos (cuenta_id, tipo, descripcion, valor, saldo_resultante, fecha) VALUES
  -- Ana: 800.000 (apertura) + 300.000 (nómina) - 100.000 (retiro) = 1.000.000
  (1, 'CONSIGNACION', 'Saldo inicial de apertura', 800000.00,  800000.00, NOW() - INTERVAL 10 DAY),
  (1, 'CONSIGNACION', 'Consignación nómina',       300000.00, 1100000.00, NOW() - INTERVAL 5 DAY),
  (1, 'RETIRO',       'Retiro en cajero',          -100000.00, 1000000.00, NOW() - INTERVAL 2 DAY),
  -- Carlos: 500.000 (apertura)
  (2, 'CONSIGNACION', 'Saldo inicial de apertura', 500000.00,  500000.00, NOW() - INTERVAL 8 DAY),
  -- Diana: 2.000.000 (apertura) + 500.000 (consignación) = 2.500.000
  (3, 'CONSIGNACION', 'Saldo inicial de apertura', 2000000.00, 2000000.00, NOW() - INTERVAL 12 DAY),
  (3, 'CONSIGNACION', 'Consignación en caja',       500000.00, 2500000.00, NOW() - INTERVAL 3 DAY);

-- ============================================================================
--  Fin del script
-- ============================================================================
