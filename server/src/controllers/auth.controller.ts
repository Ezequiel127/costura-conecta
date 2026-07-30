import type { RequestHandler } from 'express';
import type { AuthCredentials } from '../models/auth.model.js';
import type { AuthService } from '../services/auth.service.js';

export interface AuthController {
  register: RequestHandler;
  login: RequestHandler;
}

export function createAuthController(
  authService: AuthService
): AuthController {
  return {
    register: async (request, response) => {
      const result = await authService.register(
        request.body as AuthCredentials
      );

      response.set('Cache-Control', 'no-store');
      response.status(201).json({ data: result });
    },

    login: async (request, response) => {
      const result = await authService.login(request.body as AuthCredentials);

      response.set('Cache-Control', 'no-store');
      response.status(200).json({ data: result });
    },
  };
}
