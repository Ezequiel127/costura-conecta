import { Router } from 'express';
import type { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authCredentialsSchema } from '../schemas/auth.schema.js';

export function createAuthRoutes(controller: AuthController): Router {
  const authRoutes = Router();

  authRoutes.post(
    '/register',
    validateBody(authCredentialsSchema),
    controller.register
  );
  authRoutes.post(
    '/login',
    validateBody(authCredentialsSchema),
    controller.login
  );

  return authRoutes;
}
