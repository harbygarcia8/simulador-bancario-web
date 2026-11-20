/**
 * Genera hashes bcrypt para las contraseñas y PIN de los datos de prueba.
 * Uso: npm run seed:hash
 * Copia los hashes resultantes dentro de database.sql.
 */
import bcrypt from 'bcryptjs';

const items = [
  { label: 'ADMIN password (Admin123)', value: 'Admin123' },
  { label: 'CLIENTES password (Cliente123)', value: 'Cliente123' },
  { label: 'PIN Ana (1234)', value: '1234' },
  { label: 'PIN Carlos (5678)', value: '5678' },
  { label: 'PIN Diana (4321)', value: '4321' },
];

for (const it of items) {
  const hash = await bcrypt.hash(it.value, 10);
  console.log(`${it.label}\n  ${hash}\n`);
}
