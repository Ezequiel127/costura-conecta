import cors, { type CorsOptions } from 'cors';
import express, { type Request, type Response, type Router } from 'express';
import type { AppEnvironment } from './config/env.js';
import {
  createSupabaseClientProvider,
  type SupabaseClientProvider,
} from './config/supabase.js';
import { AppError } from './errors/AppError.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { createApiRoutes } from './routes/index.js';

interface CreateAppOptions {
  environment: AppEnvironment;
  router?: Router;
  clientProvider?: SupabaseClientProvider;
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
  router,
  clientProvider = createSupabaseClientProvider(environment),
}: CreateAppOptions) {
  const app = express();
  const applicationRouter =
    router ?? createApiRoutes({ environment, clientProvider });

  app.disable('x-powered-by');
  app.use(cors(createCorsOptions(environment)));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', applicationRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

let vercelAppPromise: Promise<ReturnType<typeof createApp>> | undefined;

function getVercelApp() {
  vercelAppPromise ??= import('./config/env.js').then(
    ({ loadEnvironment }) =>
      createApp({
        environment: loadEnvironment(),
      })
  );

  return vercelAppPromise;
}

export default async function handler(request: Request, response: Response) {
  const app = await getVercelApp();

  app(request, response);
}
