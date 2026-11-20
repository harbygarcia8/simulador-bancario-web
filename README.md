# 🏦 Simulador Bancario Web

> Aplicación web full-stack que simula un sistema bancario con **tres módulos** (Banca Virtual, Administración y Cajero Automático) que comparten **una misma base de datos MySQL**. Cualquier operación hecha en un módulo se refleja de inmediato en los demás.

🔗 **Repositorio:** https://github.com/harbygarcia8/simulador-bancario-web

---

## 👥 Integrantes

> _Completar con los datos del equipo._

| Nombre | Rol | Usuario GitHub |
|--------|-----|----------------|
| _(pendiente)_ | | |
| _(pendiente)_ | | |

---

## 🧰 Tecnologías utilizadas

| Capa | Tecnología |
|------|------------|
| **Backend** | Node.js + Express.js |
| **Base de datos** | MySQL 8 (driver `mysql2`, consultas parametrizadas) |
| **Frontend** | React 19 + Vite + React-Bootstrap |
| **Autenticación** | Sesiones con cookies (`express-session`, almacén en MySQL) |
| **Seguridad** | `bcryptjs` (contraseñas y PIN), `helmet`, `express-validator` |
| **HTTP cliente** | `axios` |

---

## 📁 Estructura del proyecto

```
simulador-bancario-web/
├── database.sql            # Script de BD: tablas, relaciones y datos de prueba
├── README.md               # Este archivo (guía + progreso)
├── SPEC.md                 # Especificación / enunciado del proyecto
├── .gitignore
├── backend/                # API REST (Node + Express + MySQL)
│   ├── .env.example        # Plantilla de variables de entorno
│   ├── scripts/            # generate-hashes.js, smoke-test.js
│   └── src/
│       ├── config/         # env, conexión MySQL, sesiones
│       ├── middleware/     # auth, validación, errores
│       ├── services/       # operaciones de dinero (transacciones)
│       ├── controllers/    # auth, client, admin, atm
│       ├── routes/         # /api/auth, /api/client, /api/admin, /api/atm
│       ├── app.js
│       └── server.js
└── frontend/               # SPA React (Vite + React-Bootstrap)
    └── src/
        ├── api/            # cliente axios
        ├── auth/           # contexto de sesión
        ├── components/     # navbar, rutas protegidas, tablas
        └── pages/          # home, login, cliente/, admin/, atm/
```

---

## 🚀 Puesta en marcha rápida (paso a paso)

Secuencia completa para ejecutar el proyecto desde cero. **Requiere Node 18+ y MySQL en ejecución.**

```bash
# 1) Clonar el repositorio
git clone https://github.com/harbygarcia8/simulador-bancario-web.git
cd simulador-bancario-web

# 2) Crear la base de datos y cargar los datos de prueba
mysql -u root -p < database.sql

# 3) Backend — instalar, configurar y arrancar
cd backend
npm install
cp .env.example .env          # edita .env con tus credenciales de MySQL
npm start                     # queda escuchando en http://localhost:3000

# 4) Frontend — en OTRA terminal
cd frontend
npm install
npm run dev                   # abre http://localhost:5173
```

Luego abre **http://localhost:5173** e inicia sesión con un [usuario de prueba](#-usuarios-de-prueba).

> Los detalles de cada paso (variables de entorno, usuario de MySQL con Homebrew, prueba automática) están explicados en las secciones siguientes.

---

## ✅ Requisitos para ejecutar

- **Node.js 18+** (probado con Node 22) y **npm**.
- **MySQL 8+** en ejecución (local, Docker o servidor).

---

## ⚙️ Instalación y configuración

### 1. Crear la base de datos

Carga el esquema y los datos de prueba (crea la BD `simulador_bancario`):

```bash
mysql -u root -p < database.sql
```

### 2. Configurar el backend

```bash
cd backend
npm install
cp .env.example .env     # luego edita .env con tus credenciales de MySQL
```

En `backend/.env` ajusta como mínimo:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=simulador_bancario
SESSION_SECRET=una-cadena-larga-y-aleatoria
```

> 🔐 El archivo `.env` **no se sube a git** (ya está en `.gitignore`). Nunca comitas credenciales.

### 3. Instalar el frontend

```bash
cd ../frontend
npm install
```

---

## ▶️ Cómo ejecutar el sistema

Abre **dos terminales**:

**Terminal 1 — Backend (API):**
```bash
cd backend
npm start          # http://localhost:3000
```

**Terminal 2 — Frontend (web):**
```bash
cd frontend
npm run dev        # http://localhost:5173
```

Abre el navegador en **http://localhost:5173**. El frontend redirige las llamadas `/api` al backend automáticamente (proxy de Vite), por lo que las cookies de sesión funcionan sin configuración extra.

### 🧪 Prueba automática de la API (opcional)

Con el backend corriendo, puedes verificar todo el flujo de integración (login, retiro en cajero, reflejo en banca, consignación del admin, transferencia y reglas de negocio) con:

```bash
cd backend
node scripts/smoke-test.js
```

> Nota: la prueba modifica saldos y movimientos. Para volver al estado inicial, vuelve a cargar el seed: `mysql -u root < database.sql`.

### 💡 ¿MySQL instalado con Homebrew?

En una instalación nueva de Homebrew, el usuario `root` solo acepta conexiones por *socket*, no por TCP. Crea un usuario dedicado para la app (menor privilegio) y úsalo en `.env`:

```bash
mysql -u root -e "
CREATE USER IF NOT EXISTS 'banco_app'@'127.0.0.1' IDENTIFIED BY 'TU_PASSWORD';
GRANT ALL PRIVILEGES ON simulador_bancario.* TO 'banco_app'@'127.0.0.1';
FLUSH PRIVILEGES;"
```

Luego en `backend/.env`: `DB_HOST=127.0.0.1`, `DB_USER=banco_app`, `DB_PASSWORD=TU_PASSWORD`.

---

## 🔑 Usuarios de prueba

| Rol | Acceso | Credenciales |
|-----|--------|--------------|
| **Administrador** | Banca web | `admin@banco.com` / `Admin123` |
| **Cliente (Ana)** | Banca web | `ana@banco.com` / `Cliente123` |
| **Cliente (Carlos)** | Banca web | `carlos@banco.com` / `Cliente123` |
| **Cliente (Diana)** | Banca web | `diana@banco.com` / `Cliente123` |

**Cajero automático** (cuenta + PIN):

| Titular | Número de cuenta | PIN | Saldo inicial |
|---------|------------------|-----|----------------|
| Ana Gómez | `1000000001` | `1234` | $1.000.000 |
| Carlos Ruiz | `1000000002` | `5678` | $500.000 |
| Diana Torres | `1000000003` | `4321` | $2.500.000 |

---

## ✨ Principales funcionalidades

- **Banca Virtual (cliente):** login, consulta de saldo/cuenta, historial de movimientos, transferencias, edición de perfil y cambio de contraseña.
- **Administración:** dashboard con métricas, CRUD de clientes, búsqueda, habilitar/bloquear, consulta de cuentas y saldos, consignaciones e historial general.
- **Cajero Automático:** identificación por cuenta + PIN, consulta de saldo, retiros y últimos movimientos.
- **Integración total:** los tres módulos leen y escriben sobre la misma BD MySQL; cada operación genera su movimiento y actualiza el saldo al instante.

### 🔒 Buenas prácticas de seguridad aplicadas

- Contraseñas y PIN **hasheados con bcrypt** (nunca en texto plano).
- **Consultas parametrizadas** en todo el backend (previene inyección SQL — OWASP).
- Operaciones de dinero dentro de **transacciones** con bloqueo de fila (`FOR UPDATE`) → atomicidad.
- **Validación en backend** (`express-validator`) además de la del formulario.
- Un cliente **solo accede a sus propios datos**; una cuenta bloqueada no puede operar.
- Credenciales en **variables de entorno**; cookie de sesión `httpOnly`.

> ⚠️ **Nota para el equipo:** este es un proyecto académico. Revisa y valida el código antes de usarlo en cualquier entorno productivo.

---

# 📋 Progreso de implementación

> **Estado:** backend y frontend **completos y verificados end-to-end** ✅ — la prueba automatizada `backend/scripts/smoke-test.js` reproduce el flujo del enunciado (cliente → cajero → banca → admin → transferencia + reglas de negocio + seguridad) y pasa **18/18**.

## Módulo Cliente – Banca virtual
- [x] Iniciar y cerrar sesión
- [x] Consultar saldo disponible
- [x] Consultar número y tipo de cuenta
- [x] Consultar historial de movimientos (fecha, tipo, descripción, valor, saldo resultante)
- [x] Realizar transferencias hacia otras cuentas registradas
- [x] Consultar información personal
- [x] Modificar determinados datos del perfil (teléfono, dirección)
- [x] Cambiar contraseña
- [x] Bloqueo de edición directa de saldo / número de cuenta / rol / estado / movimientos

## Módulo Administrativo
- [x] Iniciar y cerrar sesión
- [x] Crear clientes (con cuenta asociada)
- [x] Listar clientes
- [x] Buscar clientes
- [x] Consultar información detallada de un cliente
- [x] Editar determinada información
- [x] Habilitar o bloquear clientes
- [x] Consultar cuentas bancarias y su saldo
- [x] Realizar consignaciones
- [x] Consultar el historial general de movimientos
- [x] Dashboard (total clientes, activos, bloqueados, cuentas activas, suma de saldos)

## Módulo Cajero automático
- [x] Identificación por número de cuenta + PIN
- [x] Consultar saldo
- [x] Realizar retiros (valida cuenta, estado, valor > 0 y saldo suficiente)
- [x] Consultar los últimos movimientos
- [x] Cerrar la operación

## Transferencias
- [x] Verifica cuenta origen, destino, estados, valor y saldo
- [x] Descuenta origen, incrementa destino y registra los dos movimientos

## Requerimientos no funcionales
- [x] MySQL como almacenamiento
- [x] Contraseñas no almacenadas en texto plano (bcrypt)
- [x] Credenciales por variables de entorno
- [x] Validación en formularios y en backend
- [x] Un cliente no puede ver información de otro cliente
- [x] Una cuenta bloqueada no puede operar
- [x] Interfaz clara y responsiva (React-Bootstrap)
- [x] Mensajes de error y confirmación
- [x] Datos persistentes tras reiniciar el servidor

## Entregables
- [x] Código fuente funcional (backend + frontend)
- [x] Archivo `database.sql` (esquema + datos de prueba)
- [x] Archivo `README.md`
- [x] Repositorio en GitHub creado y publicado
- [ ] Agregar colaboradores (compañeros de equipo) al repositorio
- [ ] Commits de participación de **todos** los integrantes
- [ ] Diagrama de la base de datos
- [ ] Datos reales de los integrantes

## Pendientes / próximos pasos
- [x] Instalar/levantar MySQL y ejecutar `database.sql`
- [x] Prueba end-to-end: cliente → cajero (retiro) → banca (movimiento) → admin (consignación)
- [x] Inicializar repositorio Git y subirlo a GitHub
- [ ] Agregar colaboradores en GitHub → Settings ▸ Collaborators
- [ ] Generar el diagrama entidad-relación de la BD
- [ ] Completar datos de integrantes en el README

---

<details>
<summary>📘 <strong>Especificación completa del proyecto (enunciado original)</strong></summary>

El enunciado define 3 módulos sobre una misma BD MySQL, con los siguientes requisitos resumidos:

1. **Descripción** — simular operaciones bancarias básicas integradas.
2. **Tecnologías** — Backend: Node + Express. BD: MySQL. Frontend libre (aquí React).
3. **Cliente** — login, saldo, cuenta, movimientos, transferencias, perfil, contraseña.
4. **Administrador** — login, CRUD clientes, bloqueo, cuentas, consignaciones, dashboard.
5. **Cajero** — cuenta + PIN, saldo, retiros, movimientos.
6. **Transferencias** — validar y registrar movimientos en origen y destino.
7. **Integración** — todos los módulos sobre la misma BD; reflejo inmediato.
8. **Reglas de negocio** — no operar con valores ≤ 0, no retirar/transferir más del saldo, cuenta bloqueada no opera, cada operación genera movimiento, saldo modificado solo en backend.
9. **Datos de prueba** — 1 admin, 3 clientes, cuentas con saldos distintos y movimientos iniciales.
10. **Alcance** — no incluye tarjetas de crédito, préstamos, intereses, PSE, QR, etc.

</details>
