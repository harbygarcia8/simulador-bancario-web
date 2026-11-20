/**
 * Prueba de humo end-to-end contra la API en ejecución.
 * Reproduce la "prueba mínima de funcionamiento" del enunciado y verifica
 * la integración entre los tres módulos (banca, cajero, admin).
 *
 * Requisitos: backend corriendo en http://localhost:3000 y BD con datos de prueba.
 * Uso:  node scripts/smoke-test.js
 */
const BASE = 'http://localhost:3000/api';

let pasados = 0;
let fallidos = 0;

function check(nombre, condicion, detalle = '') {
  if (condicion) {
    pasados++;
    console.log(`  ✅ ${nombre}`);
  } else {
    fallidos++;
    console.log(`  ❌ ${nombre} ${detalle ? '→ ' + detalle : ''}`);
  }
}

/** Mini "cookie jar" para mantener la sesión de cada actor. */
function makeJar() {
  const cookies = new Map();
  return {
    header() {
      return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
    },
    store(res) {
      const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
      for (const sc of setCookies) {
        const pair = sc.split(';')[0];
        const idx = pair.indexOf('=');
        if (idx > -1) cookies.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
      }
    },
  };
}

async function req(jar, method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const c = jar.header();
  if (c) headers.Cookie = c;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  jar.store(res);
  let data = null;
  try { data = await res.json(); } catch { /* sin cuerpo */ }
  return { status: res.status, data };
}

const n = (v) => Number(v);

async function main() {
  console.log('\n🔎 Prueba de humo del Simulador Bancario\n');

  // 0) Health
  console.log('0) Salud de la API');
  const health = await req(makeJar(), 'GET', '/health');
  check('GET /health responde ok', health.status === 200 && health.data?.ok === true);

  // 1) Cliente Ana consulta su saldo
  console.log('\n1) Banca virtual — Ana inicia sesión y consulta saldo');
  const ana = makeJar();
  const loginAna = await req(ana, 'POST', '/auth/login', { email: 'ana@banco.com', password: 'Cliente123' });
  check('Login de Ana', loginAna.status === 200 && loginAna.data?.user?.rol === 'CLIENTE', JSON.stringify(loginAna.data));
  const cuentasAna = await req(ana, 'GET', '/client/cuentas');
  const cuentaAna = cuentasAna.data?.cuentas?.[0];
  check('Ana tiene una cuenta', !!cuentaAna, JSON.stringify(cuentasAna.data));
  const saldoInicial = n(cuentaAna?.saldo);
  console.log(`     Saldo inicial de Ana: ${saldoInicial}`);

  // 2-4) Ana entra al cajero y retira 100.000
  console.log('\n2-4) Cajero — Ana retira $100.000');
  const cajero = makeJar();
  const atmLogin = await req(cajero, 'POST', '/atm/login', { numeroCuenta: cuentaAna?.numero_cuenta, pin: '1234' });
  check('Login en cajero (cuenta + PIN)', atmLogin.status === 200, JSON.stringify(atmLogin.data));
  const retiro = await req(cajero, 'POST', '/atm/retiro', { valor: 100000 });
  check('Retiro de $100.000 exitoso', retiro.status === 200, JSON.stringify(retiro.data));
  check('Saldo disminuyó 100.000', n(retiro.data?.saldo) === saldoInicial - 100000, `esperado ${saldoInicial - 100000}, obtuvo ${retiro.data?.saldo}`);

  // 5-6) Ana vuelve a banca: el retiro aparece y el saldo coincide
  console.log('\n5-6) Banca virtual — el retiro se refleja');
  const movAna = await req(ana, 'GET', '/client/movimientos');
  const ultimo = movAna.data?.movimientos?.[0];
  check('El último movimiento es un RETIRO', ultimo?.tipo === 'RETIRO', JSON.stringify(ultimo));
  check('Valor del retiro es -100.000', n(ultimo?.valor) === -100000, String(ultimo?.valor));
  const cuentasAna2 = await req(ana, 'GET', '/client/cuentas');
  check('Saldo en banca coincide con cajero', n(cuentasAna2.data?.cuentas?.[0]?.saldo) === saldoInicial - 100000);

  // 7) El admin ve el mismo saldo
  console.log('\n7) Admin — ve el mismo saldo');
  const admin = makeJar();
  const loginAdmin = await req(admin, 'POST', '/auth/login', { email: 'admin@banco.com', password: 'Admin123' });
  check('Login de admin', loginAdmin.status === 200 && loginAdmin.data?.user?.rol === 'ADMIN', JSON.stringify(loginAdmin.data));
  const cuentasAdmin = await req(admin, 'GET', '/admin/cuentas');
  const cuentaAnaAdmin = cuentasAdmin.data?.cuentas?.find((c) => c.numero_cuenta === cuentaAna?.numero_cuenta);
  check('Admin ve el saldo actualizado de Ana', n(cuentaAnaAdmin?.saldo) === saldoInicial - 100000, String(cuentaAnaAdmin?.saldo));

  // 8) El admin hace una consignación de 200.000
  console.log('\n8) Admin — consigna $200.000 a Ana');
  const consig = await req(admin, 'POST', '/admin/consignaciones', { cuentaId: cuentaAna?.id, valor: 200000, descripcion: 'Consignación de prueba' });
  check('Consignación exitosa', consig.status === 200, JSON.stringify(consig.data));
  check('Nuevo saldo = anterior + 200.000', n(consig.data?.saldo) === saldoInicial - 100000 + 200000, String(consig.data?.saldo));

  // 9) Ana vuelve a ingresar y ve el nuevo saldo
  console.log('\n9) Banca virtual — Ana ve el nuevo saldo');
  const cuentasAna3 = await req(ana, 'GET', '/client/cuentas');
  check('Saldo final de Ana correcto', n(cuentasAna3.data?.cuentas?.[0]?.saldo) === saldoInicial + 100000, String(cuentasAna3.data?.cuentas?.[0]?.saldo));

  // 10) Transferencia Ana -> Carlos
  console.log('\n10) Transferencia — Ana envía $50.000 a Carlos (1000000002)');
  const transf = await req(ana, 'POST', '/client/transferencias', { cuentaOrigenId: cuentaAna?.id, numeroCuentaDestino: '1000000002', valor: 50000, descripcion: 'Pago prueba' });
  check('Transferencia exitosa', transf.status === 200, JSON.stringify(transf.data));

  // 11) Reglas de negocio: retiro mayor al saldo debe fallar
  console.log('\n11) Reglas de negocio — retiro excesivo debe rechazarse');
  const retiroMalo = await req(cajero, 'POST', '/atm/retiro', { valor: 999999999 });
  check('Retiro sin saldo suficiente es rechazado', retiroMalo.status === 400, `status ${retiroMalo.status}`);
  const valorNegativo = await req(cajero, 'POST', '/atm/retiro', { valor: -100 });
  check('Retiro con valor negativo es rechazado', valorNegativo.status === 422 || valorNegativo.status === 400, `status ${valorNegativo.status}`);

  // 12) Aislamiento: Ana no puede usar rutas de admin
  console.log('\n12) Seguridad — un cliente no accede a rutas de admin');
  const intruso = await req(ana, 'GET', '/admin/dashboard');
  check('Cliente bloqueado de /admin (403)', intruso.status === 403, `status ${intruso.status}`);

  // Resumen
  console.log(`\n────────────────────────────────────────`);
  console.log(`  Resultado: ${pasados} ✅   ${fallidos} ❌`);
  console.log(`────────────────────────────────────────\n`);
  process.exit(fallidos === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Error ejecutando la prueba:', err.message);
  console.error('¿Está el backend corriendo en http://localhost:3000 ?');
  process.exit(1);
});
