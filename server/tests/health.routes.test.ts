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

describe('GET /api/health', () => {
  it('retorna o status do serviço', async () => {
    const app = createApp({ environment: testEnvironment });

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      service: 'costura-conecta-api',
    });
  });
});
