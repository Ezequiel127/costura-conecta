import { Router } from 'express';
import type { AppEnvironment } from '../config/env.js';
import type { SupabaseClientProvider } from '../config/supabase.js';
import { createAuthController } from '../controllers/auth.controller.js';
import { createAuthService } from '../services/auth.service.js';
import { createAuthRoutes } from './auth.routes.js';
import { healthRoutes } from './health.routes.js';

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

  apiRoutes.use(healthRoutes);
  apiRoutes.use('/auth', createAuthRoutes(authController));

  return apiRoutes;
}
