import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { config } from './config/env.js';
import { sessionMiddleware } from './config/session.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import clientRoutes from './routes/client.routes.js';
import adminRoutes from './routes/admin.routes.js';
import atmRoutes from './routes/atm.routes.js';

export function createApp() {
  const app = express();

  // Seguridad de cabeceras HTTP
  app.use(helmet());

  // CORS con credenciales (para las cookies de sesión desde el frontend)
  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (!config.isProduction) {
    app.use(morgan('dev'));
  }

  // Sesiones (cookie httpOnly respaldada en MySQL)
  app.use(sessionMiddleware);

  // Health check
  app.get('/api/health', (req, res) => res.json({ ok: true, servicio: 'simulador-bancario' }));

  // Rutas de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/client', clientRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/atm', atmRoutes);

  // 404 + manejador de errores (siempre al final)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
