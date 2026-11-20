import { createApp } from './app.js';
import { config } from './config/env.js';
import { assertDatabaseConnection } from './config/db.js';

async function main() {
  try {
    await assertDatabaseConnection();

    const app = createApp();
    app.listen(config.port, () => {
      console.log(`[server] 🚀 API escuchando en http://localhost:${config.port}`);
      console.log(`[server] 🌎 Entorno: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('[server] ❌ No se pudo iniciar. ¿Está MySQL corriendo y la base creada?');
    console.error('[server]   Detalle:', err.message);
    process.exit(1);
  }
}

main();
