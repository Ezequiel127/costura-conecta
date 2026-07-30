import type {
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import type { AppEnvironment } from '../src/config/env.js';
import type { SupabaseClientProvider } from '../src/config/supabase.js';

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

const testSession = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 1_800_000_000,
  user: testUser,
} as Session;

function createMockClientProvider() {
  const signUp = vi.fn();
  const signInWithPassword = vi.fn();
  const getUser = vi.fn();
  const authClient = {
    auth: {
      signUp,
      signInWithPassword,
      getUser,
    },
  } as unknown as SupabaseClient;
  const contextualClient = {} as SupabaseClient;
  const clientProvider: SupabaseClientProvider = {
    createAuthClient: vi.fn(() => authClient),
    createContextualClient: vi.fn(() => contextualClient),
  };

  return {
    authClient,
    clientProvider,
    contextualClient,
    getUser,
    signInWithPassword,
    signUp,
  };
}

describe('POST /api/auth/register', () => {
  it('retorna 400 para um body inválido ou com campo desconhecido', async () => {
    const { clientProvider, signUp } = createMockClientProvider();
    const app = createApp({
      environment: testEnvironment,
      clientProvider,
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'usuario@example.com',
      password: 'senha-segura',
      role: 'admin',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Dados da requisição inválidos.',
    });
    expect(response.body.error.details).toEqual(expect.any(Array));
    expect(signUp).not.toHaveBeenCalled();
  });

  it('retorna 201 com sessão mínima quando o cadastro autentica imediatamente', async () => {
    const { clientProvider, signUp } = createMockClientProvider();
    signUp.mockResolvedValue({
      data: {
        user: testUser,
        session: testSession,
      },
      error: null,
    });
    const app = createApp({
      environment: testEnvironment,
      clientProvider,
    });

    const response = await request(app).post('/api/auth/register').send({
      email: '  Usuario@Example.COM  ',
      password: 'senha-segura',
    });

    expect(response.status).toBe(201);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(signUp).toHaveBeenCalledWith({
      email: 'usuario@example.com',
      password: 'senha-segura',
      options: undefined,
    });
    expect(response.body).toEqual({
      data: {
        user: {
          id: testUser.id,
          email: testUser.email,
        },
        session: {
          accessToken: testSession.access_token,
          refreshToken: testSession.refresh_token,
          tokenType: testSession.token_type,
          expiresIn: testSession.expires_in,
          expiresAt: testSession.expires_at,
        },
        emailConfirmationRequired: false,
      },
    });
  });

  it('retorna 201 com sessão nula enquanto aguarda confirmação de e-mail', async () => {
    const { clientProvider, signUp } = createMockClientProvider();
    signUp.mockResolvedValue({
      data: {
        user: testUser,
        session: null,
      },
      error: null,
    });
    const app = createApp({
      environment: testEnvironment,
      clientProvider,
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'usuario@example.com',
      password: 'senha-segura',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      data: {
        user: {
          id: testUser.id,
          email: testUser.email,
        },
        session: null,
        emailConfirmationRequired: true,
      },
    });
  });

  it('mapeia um conflito identificável sem expor detalhes da conta', async () => {
    const { clientProvider, signUp } = createMockClientProvider();
    signUp.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: {
        code: 'user_already_exists',
        status: 422,
        message: 'User already registered',
      },
    });
    const app = createApp({
      environment: testEnvironment,
      clientProvider,
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'usuario@example.com',
      password: 'senha-segura',
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: {
        code: 'AUTH_USER_CONFLICT',
        message: 'Não foi possível concluir o cadastro.',
      },
    });
    expect(response.text).not.toContain('already');
  });
});

describe('POST /api/auth/login', () => {
  it('retorna 400 para credenciais inválidas no schema', async () => {
    const { clientProvider, signInWithPassword } =
      createMockClientProvider();
    const app = createApp({
      environment: testEnvironment,
      clientProvider,
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'e-mail-invalido',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Dados da requisição inválidos.',
    });
    expect(response.body.error.details).toEqual(expect.any(Array));
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('retorna 401 sem distinguir o motivo das credenciais inválidas', async () => {
    const { clientProvider, signInWithPassword } =
      createMockClientProvider();
    signInWithPassword.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: {
        code: 'invalid_credentials',
        status: 400,
        message: 'Invalid login credentials',
      },
    });
    const app = createApp({
      environment: testEnvironment,
      clientProvider,
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'usuario@example.com',
      password: 'senha-segura',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'E-mail ou senha inválidos.',
      },
    });
  });

  it('retorna 200 com o contrato mínimo da sessão', async () => {
    const { clientProvider, signInWithPassword } =
      createMockClientProvider();
    signInWithPassword.mockResolvedValue({
      data: {
        user: testUser,
        session: testSession,
      },
      error: null,
    });
    const app = createApp({
      environment: testEnvironment,
      clientProvider,
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'usuario@example.com',
      password: 'senha-segura',
    });

    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual({
      data: {
        user: {
          id: testUser.id,
          email: testUser.email,
        },
        session: {
          accessToken: testSession.access_token,
          refreshToken: testSession.refresh_token,
          tokenType: testSession.token_type,
          expiresIn: testSession.expires_in,
          expiresAt: testSession.expires_at,
        },
      },
    });
  });

  it('transforma uma falha inesperada em 500 sem vazar detalhes', async () => {
    const { clientProvider, signInWithPassword } =
      createMockClientProvider();
    signInWithPassword.mockRejectedValue(
      new Error('Detalhe interno do provedor de autenticação.')
    );
    const app = createApp({
      environment: testEnvironment,
      clientProvider,
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'usuario@example.com',
      password: 'senha-segura',
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ocorreu um erro interno.',
      },
    });
    expect(response.text).not.toContain('Detalhe interno');
    expect(response.text).not.toContain('Error:');
  });
});
