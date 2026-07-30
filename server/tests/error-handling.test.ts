import { Router } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { AppEnvironment } from '../src/config/env.js';

const testEnvironment: AppEnvironment = {
  NODE_ENV: 'test',
  PORT: 3001,
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
  CORS_ALLOWED_ORIGINS: ['http://localhost:5173'],
};

describe('tratamento global de erros', () => {
  it('retorna o erro padronizado para uma rota desconhecida', async () => {
    const app = createApp({ environment: testEnvironment });

    const response = await request(app).get('/api/rota-inexistente');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'Rota não encontrada.',
      },
    });
  });

  it('oculta os detalhes de um erro inesperado', async () => {
    const testRouter = Router();

    testRouter.get('/unexpected-error', () => {
      throw new Error('Detalhe interno que não deve ser exposto.');
    });

    const app = createApp({
      environment: testEnvironment,
      router: testRouter,
    });

    const response = await request(app).get('/api/unexpected-error');

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
