import cors, { type CorsOptions } from 'cors';
import express, { type Router } from 'express';
import type { AppEnvironment } from './config/env.js';
import { AppError } from './errors/AppError.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { apiRoutes } from './routes/index.js';

interface CreateAppOptions {
  environment: AppEnvironment;
  router?: Router;
}

function createCorsOptions(environment: AppEnvironment): CorsOptions {
  return {
    origin(origin, callback) {
      if (
        origin === undefined ||
        environment.CORS_ALLOWED_ORIGINS.includes(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(
        new AppError(403, 'CORS_ORIGIN_NOT_ALLOWED', 'Origem não permitida.')
      );
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  };
}

export function createApp({
  environment,
  router = apiRoutes,
}: CreateAppOptions) {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors(createCorsOptions(environment)));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', router);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
