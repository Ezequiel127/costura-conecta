import { Router } from 'express';
import type { AppEnvironment } from '../config/env.js';
import type { SupabaseClientProvider } from '../config/supabase.js';
import { createAuthController } from '../controllers/auth.controller.js';
import { createJobController } from '../controllers/job.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { createAuthService } from '../services/auth.service.js';
import { createJobService } from '../services/job.service.js';
import { createAuthRoutes } from './auth.routes.js';
import { healthRoutes } from './health.routes.js';
import { createJobRoutes } from './job.routes.js';

interface CreateApiRoutesOptions {
  environment: AppEnvironment;
  clientProvider: SupabaseClientProvider;
}

export function createApiRoutes({
  environment,
  clientProvider,
}: CreateApiRoutesOptions): Router {
  const apiRoutes = Router();
  const authService = createAuthService(environment, clientProvider);
  const authController = createAuthController(authService);
  const jobService = createJobService(clientProvider);
  const jobController = createJobController(jobService);
  const authenticate = createAuthMiddleware(clientProvider);

  apiRoutes.use(healthRoutes);
  apiRoutes.use('/auth', createAuthRoutes(authController));
  apiRoutes.use('/jobs', createJobRoutes(jobController, authenticate));

  return apiRoutes;
}
