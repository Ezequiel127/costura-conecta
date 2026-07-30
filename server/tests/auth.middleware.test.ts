import {
  Router,
  type Request,
  type Response,
} from 'express';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import type { AppEnvironment } from '../src/config/env.js';
import type { SupabaseClientProvider } from '../src/config/supabase.js';
import { createAuthMiddleware } from '../src/middlewares/auth.middleware.js';

const testEnvironment: AppEnvironment = {
  NODE_ENV: 'test',
  PORT: 3001,
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
  CORS_ALLOWED_ORIGINS: ['http://localhost:5173'],
};

const testUser = {
  id: 'bf965ceb-6e48-4970-854f-2c9f86a6b959',
  email: 'usuario@example.com',
} as User;

function createMiddlewareTestContext() {
  const getUser = vi.fn();
  const verificationClient = {
    auth: {
      getUser,
    },
  } as unknown as SupabaseClient;
  const contextualClient = {} as SupabaseClient;
  const clientProvider: SupabaseClientProvider = {
    createAuthClient: vi.fn(() => verificationClient),
    createPublicClient: vi.fn(() => verificationClient),
    createContextualClient: vi.fn(() => contextualClient),
  };
  const router = Router();

  router.get(
    '/protected',
    createAuthMiddleware(clientProvider),
    (request: Request, response: Response) => {
      response.status(200).json({
        userId: request.auth?.user.id,
        accessToken: request.auth?.accessToken,
        contextualClientAttached:
          request.auth?.supabase === contextualClient,
      });
    }
  );

  const app = createApp({
    environment: testEnvironment,
    router,
    clientProvider,
  });

  return {
    app,
    clientProvider,
    contextualClient,
    getUser,
  };
}

describe('middleware de autenticação bearer', () => {
  it('retorna 401 AUTH_REQUIRED quando o header está ausente', async () => {
    const { app, clientProvider } = createMiddlewareTestContext();

    const response = await request(app).get('/api/protected');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Autenticação necessária.',
      },
    });
    expect(clientProvider.createAuthClient).not.toHaveBeenCalled();
  });

  it('retorna 401 INVALID_TOKEN para um bearer malformado', async () => {
    const { app, clientProvider } = createMiddlewareTestContext();

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer token-com-espaço extra');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token de acesso inválido ou expirado.',
      },
    });
    expect(clientProvider.createAuthClient).not.toHaveBeenCalled();
  });

  it('retorna 401 INVALID_TOKEN quando getUser rejeita o token', async () => {
    const { app, clientProvider, getUser } =
      createMiddlewareTestContext();
    getUser.mockResolvedValue({
      data: {
        user: null,
      },
      error: {
        code: 'bad_jwt',
        status: 401,
        message: 'Invalid JWT',
      },
    });

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer invalid-test-token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token de acesso inválido ou expirado.',
      },
    });
    expect(getUser).toHaveBeenCalledWith('invalid-test-token');
    expect(
      clientProvider.createContextualClient
    ).not.toHaveBeenCalled();
  });

  it('anexa usuário, token e cliente contextual após validação', async () => {
    const { app, clientProvider, contextualClient, getUser } =
      createMiddlewareTestContext();
    getUser.mockResolvedValue({
      data: {
        user: testUser,
      },
      error: null,
    });

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer valid-test-token');

    expect(response.status).toBe(200);
    expect(getUser).toHaveBeenCalledWith('valid-test-token');
    expect(
      clientProvider.createContextualClient
    ).toHaveBeenCalledWith('valid-test-token');
    expect(response.body).toEqual({
      userId: testUser.id,
      accessToken: 'valid-test-token',
      contextualClientAttached: true,
    });
    expect(contextualClient).toBeDefined();
  });
});
