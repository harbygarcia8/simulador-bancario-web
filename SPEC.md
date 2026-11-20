# 🏦 Proyecto Integrador – Simulador Bancario Web

> Aplicación web que simula las funciones básicas de un sistema bancario, compuesta por **tres módulos** que trabajan sobre **una misma base de datos**. Cualquier operación realizada desde un módulo se refleja inmediatamente en los demás.

---

## 📑 Tabla de contenido

1. [Descripción](#1-descripción)
2. [Tecnologías](#2-tecnologías)
3. [Módulo de Cliente – Banca virtual](#3-módulo-de-cliente--banca-virtual)
4. [Módulo Administrativo del banco](#4-módulo-administrativo-del-banco)
5. [Módulo de Cajero automático](#5-módulo-de-cajero-automático)
6. [Transferencias](#6-transferencias)
7. [Integración entre módulos](#7-integración-entre-módulos)
8. [Requerimientos funcionales](#8-requerimientos-funcionales)
9. [Requerimientos no funcionales](#9-requerimientos-no-funcionales)
10. [Reglas de negocio](#10-reglas-de-negocio)
11. [Git y GitHub](#11-git-y-github)
12. [README (contenido requerido)](#12-readme-contenido-requerido)
13. [Base de datos](#13-base-de-datos)
14. [Datos de prueba](#14-datos-de-prueba)
15. [Alcance del proyecto](#15-alcance-del-proyecto)
16. [Entregables](#16-entregables)
17. [Prueba mínima de funcionamiento](#17-prueba-mínima-de-funcionamiento)

---

## 1. Descripción

Desarrollar una aplicación web que simule las funciones básicas de un sistema bancario. El sistema está compuesto por **tres módulos**:

| Módulo | Descripción |
|--------|-------------|
| 🧑‍💼 **Banca virtual del cliente** | El cliente consulta y opera sobre su propia cuenta. |
| 🛠️ **Módulo administrativo** | El banco gestiona clientes, cuentas y movimientos. |
| 🏧 **Cajero automático virtual** | Operación rápida identificándose con número de cuenta y PIN. |

Los tres módulos trabajan sobre la **misma base de datos**, de manera que cualquier operación se refleja inmediatamente en los demás.

**Objetivo:** aplicar los conceptos del curso → desarrollo web, bases de datos, autenticación, sesiones, roles, operaciones CRUD, validaciones y reglas de negocio.

---

## 2. Tecnologías

### ✅ Obligatorias

| Capa | Tecnología |
|------|------------|
| **Backend** | Node.js + Express.js |
| **Base de datos** | MySQL |

### 🎨 Frontend (libre elección)

- HTML
- CSS
- JavaScript
- Bootstrap
- *Otras tecnologías de frontend, si son pertinentes para el proyecto.*

---

## 3. Módulo de Cliente – Banca virtual

El cliente inicia sesión y accede **únicamente** a la información de su propia cuenta.

### Funcionalidades mínimas

- [ ] Iniciar y cerrar sesión
- [ ] Consultar saldo disponible
- [ ] Consultar número y tipo de cuenta
- [ ] Consultar historial de movimientos
- [ ] Realizar transferencias hacia otras cuentas registradas
- [ ] Consultar información personal
- [ ] Modificar determinados datos del perfil
- [ ] Cambiar contraseña

### Historial de movimientos

El historial debe mostrar, como mínimo:

| Campo | Ejemplo |
|-------|---------|
| Fecha | 2026-11-20 |
| Tipo de movimiento | Retiro cajero |
| Descripción | Retiro en cajero automático |
| Valor | -$200.000 |
| Saldo resultante | $800.000 |

### 🚫 El cliente **NO** puede modificar directamente

- Saldo
- Número de cuenta
- Rol
- Estado de la cuenta
- Movimientos financieros

---

## 4. Módulo Administrativo del banco

El administrador cuenta con un panel **independiente** para gestionar la información general del banco.

### Funcionalidades mínimas

- [ ] Iniciar y cerrar sesión
- [ ] Crear clientes
- [ ] Listar clientes
- [ ] Buscar clientes
- [ ] Consultar información detallada de un cliente
- [ ] Editar determinada información
- [ ] Habilitar o bloquear clientes
- [ ] Consultar cuentas bancarias
- [ ] Consultar el saldo de cada cuenta
- [ ] Realizar consignaciones
- [ ] Consultar el historial general de movimientos

### 📊 Dashboard administrativo (mínimo)

| Indicador | Descripción |
|-----------|-------------|
| 👥 Total de clientes | Cantidad total de clientes |
| ✅ Clientes / cuentas activas | Cantidad activa |
| 🔒 Clientes bloqueados | Cantidad bloqueada |
| 💰 Suma total de saldos | Suma de todos los saldos almacenados |

> ℹ️ **No** es necesario eliminar físicamente los clientes de la base de datos. Se recomienda manejar **estados**:
>
> `ACTIVO` · `INACTIVO` · `BLOQUEADO`

---

## 5. Módulo de Cajero automático

Interfaz que simula el funcionamiento básico de un cajero. El cliente se identifica con:

- Número de cuenta
- PIN

### Funcionalidades mínimas

- [ ] Consultar saldo
- [ ] Realizar retiros
- [ ] Consultar los últimos movimientos
- [ ] Cerrar la operación

### Validaciones de un retiro

Para realizar un retiro, el sistema debe comprobar:

1. Que la cuenta **exista**.
2. Que esté **activa**.
3. Que el valor sea **mayor que cero**.
4. Que exista **saldo suficiente**.

### Resultado de un retiro correcto

- ⬇️ Disminuye el saldo
- 📝 Se registra el movimiento
- 🔢 Se muestra el nuevo saldo

---

## 6. Transferencias

El cliente transfiere dinero hacia otra cuenta registrada en el sistema.

### Verificaciones previas

- Existencia de la **cuenta origen**
- Existencia de la **cuenta destino**
- Estado de **ambas cuentas**
- Valor **válido**
- **Saldo suficiente**

### Pasos de una transferencia

1. Descontar el dinero de la cuenta **origen**.
2. Incrementar el saldo de la cuenta **destino**.
3. Registrar el movimiento en la cuenta **origen**.
4. Registrar el movimiento en la cuenta **destino**.

---

## 7. Integración entre módulos

> ⭐ **Este es uno de los requisitos principales del proyecto.**

Todos los módulos deben utilizar la **misma información** almacenada en MySQL.

### Ejemplo de flujo integrado

```text
Saldo inicial del cliente ........... $1.000.000
Retiro desde el cajero .............. -$200.000
─────────────────────────────────────────────
Nuevo saldo ......................... $800.000
```

Al ingresar luego a la **banca virtual**, el cliente debe visualizar:

- Saldo: **$800.000**
- Movimiento: **Retiro cajero → -$200.000**

El **administrador** también debe visualizar el mismo saldo actualizado.

---

## 8. Requerimientos funcionales

El sistema debe cumplir como mínimo con:

- [ ] Autenticación de usuarios
- [ ] Manejo de clientes y administradores
- [ ] Consulta de saldo
- [ ] Consulta de movimientos
- [ ] Modificación de perfil
- [ ] Cambio de contraseña
- [ ] Transferencias entre cuentas
- [ ] Creación y consulta de clientes
- [ ] Habilitación y bloqueo de usuarios
- [ ] Consignaciones
- [ ] Consulta general de cuentas
- [ ] Consulta general de movimientos
- [ ] Dashboard administrativo
- [ ] Simulación de cajero automático
- [ ] Consulta de saldo desde cajero
- [ ] Retiros desde cajero
- [ ] Registro automático de cada movimiento financiero
- [ ] Actualización de la información entre todos los módulos

---

## 9. Requerimientos no funcionales

- [ ] Utilizar **MySQL** para almacenar la información
- [ ] Las contraseñas **no** se almacenan en texto plano
- [ ] Las credenciales de la base de datos se manejan mediante **variables de entorno**
- [ ] El sistema valida la información recibida desde los formularios
- [ ] Las validaciones importantes se realizan **también en el backend**
- [ ] Un cliente **no** puede consultar información de otro cliente
- [ ] Una cuenta **bloqueada** no puede realizar operaciones
- [ ] La interfaz es clara y organizada
- [ ] Las principales pantallas son **responsivas**
- [ ] El sistema muestra mensajes claros de error y confirmación
- [ ] Los datos se mantienen después de reiniciar el servidor

---

## 10. Reglas de negocio

| # | Regla |
|---|-------|
| 1 | Un cliente solo puede consultar **sus propias** cuentas. |
| 2 | El cliente **no** puede modificar directamente su saldo. |
| 3 | No se permiten operaciones con valores **≤ 0**. |
| 4 | No se puede **retirar** más dinero del disponible. |
| 5 | No se puede **transferir** más dinero del disponible. |
| 6 | Una cuenta **bloqueada** no puede realizar operaciones. |
| 7 | Cada **consignación** genera un movimiento. |
| 8 | Cada **retiro** genera un movimiento. |
| 9 | Cada **transferencia** genera los movimientos correspondientes. |
| 10 | Los movimientos financieros **no** se eliminan desde el sistema. |
| 11 | El saldo se modifica desde el **backend** y se almacena en MySQL. |

---

## 11. Git y GitHub

El proyecto debe utilizar Git y GitHub. Cada equipo debe:

- [ ] Crear un repositorio del proyecto
- [ ] Agregar a **todos** los integrantes como colaboradores
- [ ] Subir el código fuente
- [ ] Realizar commits **durante** el proceso de desarrollo
- [ ] Evitar realizar un único commit al finalizar
- [ ] Incluir un archivo `.gitignore`
- [ ] **No** subir `node_modules`
- [ ] **No** subir el archivo `.env`

> ⚠️ Todos los integrantes deben tener **evidencia de participación** en el repositorio.

---

## 12. README (contenido requerido)

El repositorio debe incluir un `README.md` que contenga como mínimo:

- [ ] Nombre del proyecto
- [ ] Descripción
- [ ] Integrantes
- [ ] Tecnologías utilizadas
- [ ] Requisitos para ejecutar el proyecto
- [ ] Instrucciones de instalación
- [ ] Configuración de la base de datos
- [ ] Forma de ejecutar el sistema
- [ ] Usuarios de prueba
- [ ] Principales funcionalidades

---

## 13. Base de datos

El proyecto debe entregar un archivo **`database.sql`** que permita crear la base de datos necesaria para ejecutar el sistema.

### Debe incluir

- Tablas
- Relaciones
- Llaves primarias
- Llaves foráneas
- Restricciones necesarias
- Datos básicos de prueba

### Conceptos mínimos (o equivalentes)

| Entidad | Propósito |
|---------|-----------|
| **Usuarios** | Clientes y administradores |
| **Cuentas** | Cuentas bancarias asociadas a usuarios |
| **Movimientos** | Historial financiero (retiros, consignaciones, etc.) |
| **Transferencias** | Operaciones entre cuentas |

---

## 14. Datos de prueba

El sistema debe incluir información suficiente para demostrar su funcionamiento:

| Dato | Cantidad mínima |
|------|-----------------|
| Administrador | 1 |
| Clientes | 3 |
| Cuentas bancarias | Varias |
| Saldos | Diferentes valores |
| Movimientos iniciales | Algunos |

---

## 15. Alcance del proyecto

El objetivo es **simular operaciones bancarias básicas**.

### 🚫 NO es necesario implementar

- Tarjetas de crédito
- Préstamos
- Intereses
- Inversiones
- Pagos de servicios
- PSE
- Pagos QR
- Transferencias hacia bancos reales
- Monedas extranjeras
- Biometría
- Integración con sistemas bancarios reales

> 💡 Estas funcionalidades podrán desarrollarse **únicamente como mejoras adicionales** después de completar los requisitos obligatorios.

---

## 16. Entregables

Cada equipo debe entregar:

1. 📦 **Repositorio de GitHub**
2. 💻 **Código fuente funcional**
3. 🗄️ **Archivo `database.sql`**
4. 📄 **Archivo `README.md`**
5. 🧩 **Diagrama de la base de datos**
6. ✅ **Sistema funcional para demostración**

---

## 17. Prueba mínima de funcionamiento

Durante la presentación debe demostrarse un flujo similar a:

1. Un cliente consulta su saldo.
2. Ingresa al cajero.
3. Realiza un retiro.
4. El saldo **disminuye**.
5. Ingresa nuevamente a la banca virtual.
6. El retiro **aparece** en sus movimientos.
7. El administrador consulta la cuenta y observa el **mismo saldo**.
8. El administrador realiza una **consignación**.
9. El cliente vuelve a ingresar y visualiza el **nuevo saldo**.

> 🎯 **Objetivo principal:** demostrar que los tres módulos están correctamente integrados y utilizan la misma información.
