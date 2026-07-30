import type { SupabaseClient } from '@supabase/supabase-js';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import type { AppEnvironment } from '../src/config/env.js';
import type { SupabaseClientProvider } from '../src/config/supabase.js';
import type { PublicJobBoardRow } from '../src/models/job.model.js';

const testEnvironment: AppEnvironment = {
  NODE_ENV: 'test',
  PORT: 3001,
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
  CORS_ALLOWED_ORIGINS: ['http://localhost:5173'],
};

const firstJobRow: PublicJobBoardRow & {
  user_id: string;
  email: string;
  address: string;
} = {
  id: 'f4220fe3-196b-4d89-bcfe-c288db260d88',
  company_id: '0061a3a7-6d70-4f8b-8341-5697879a4ea3',
  title: 'Costureira para produção',
  city: 'Picos',
  skill: 'Máquina reta',
  deadline: '2026-08-20',
  description: 'Descrição',
  created_at: '2026-07-30T12:00:00.000Z',
  company_name: 'Empresa',
  company_phone: '5589999999999',
  user_id: 'private-user-id',
  email: 'privado@example.com',
  address: 'Endereço privado',
};

const secondJobRow: PublicJobBoardRow = {
  id: 'a12b80bf-486c-48e8-b826-5429820095f9',
  company_id: '55bc404c-a56b-48ff-bca2-9e65181d5cae',
  title: 'Costureira pilotista',
  city: 'Oeiras',
  skill: 'Modelagem',
  deadline: '2026-08-15',
  description: 'Produção de peças piloto.',
  created_at: '2026-07-29T09:30:00.000Z',
  company_name: 'Ateliê Modelo',
  company_phone: '5589888888888',
};

function createJobTestContext() {
  const select = vi.fn();
  const order = vi.fn();
  const eq = vi.fn();
  const maybeSingle = vi.fn();
  const queryBuilder = {
    select,
    order,
    eq,
    maybeSingle,
  };

  select.mockReturnValue(queryBuilder);
  eq.mockReturnValue(queryBuilder);

  const from = vi.fn(() => queryBuilder);
  const schema = vi.fn(() => ({ from }));
  const publicClient = {
    schema,
  } as unknown as SupabaseClient;
  const unusedClient = {} as SupabaseClient;
  const clientProvider: SupabaseClientProvider = {
    createAuthClient: vi.fn(() => unusedClient),
    createPublicClient: vi.fn(() => publicClient),
    createContextualClient: vi.fn(() => unusedClient),
  };
  const app = createApp({
    environment: testEnvironment,
    clientProvider,
  });

  return {
    app,
    clientProvider,
    eq,
    from,
    maybeSingle,
    order,
    schema,
    select,
  };
}

describe('GET /api/jobs', () => {
  it('retorna 200 com vagas públicas mapeadas e sem campos privados', async () => {
    const { app, clientProvider, from, order, schema, select } =
      createJobTestContext();
    order.mockResolvedValue({
      data: [firstJobRow],
      error: null,
    });

    const response = await request(app).get('/api/jobs');

    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(clientProvider.createPublicClient).toHaveBeenCalledOnce();
    expect(clientProvider.createAuthClient).not.toHaveBeenCalled();
    expect(schema).toHaveBeenCalledWith('public');
    expect(from).toHaveBeenCalledWith('public_job_board');
    expect(select).toHaveBeenCalledWith(
      'id, company_id, title, city, skill, deadline, description, created_at, company_name, company_phone'
    );
    expect(order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
    expect(response.body).toEqual({
      data: [
        {
          id: firstJobRow.id,
          companyId: firstJobRow.company_id,
          title: firstJobRow.title,
          city: firstJobRow.city,
          skill: firstJobRow.skill,
          deadline: firstJobRow.deadline,
          description: firstJobRow.description,
          createdAt: firstJobRow.created_at,
          company: {
            name: firstJobRow.company_name,
            phone: firstJobRow.company_phone,
          },
        },
      ],
    });
    expect(response.text).not.toContain('user_id');
    expect(response.text).not.toContain('privado@example.com');
    expect(response.text).not.toContain('Endereço privado');
  });

  it('garante ordem decrescente por created_at', async () => {
    const { app, order } = createJobTestContext();
    order.mockResolvedValue({
      data: [secondJobRow, firstJobRow],
      error: null,
    });

    const response = await request(app).get('/api/jobs');

    expect(response.status).toBe(200);
    expect(order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
    expect(response.body.data.map((job: { id: string }) => job.id)).toEqual([
      firstJobRow.id,
      secondJobRow.id,
    ]);
  });

  it('retorna um array vazio quando não existem vagas', async () => {
    const { app, order } = createJobTestContext();
    order.mockResolvedValue({
      data: [],
      error: null,
    });

    const response = await request(app).get('/api/jobs');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [] });
  });

  it('transforma falha do Supabase em 500 sem detalhes internos', async () => {
    const { app, order } = createJobTestContext();
    order.mockResolvedValue({
      data: null,
      error: {
        code: '42501',
        message: 'permission denied at https://secret.supabase.co',
        details: 'SQL: select restricted_column from restricted_relation',
        hint: 'test-publishable-key',
      },
    });

    const response = await request(app).get('/api/jobs');

    expect(response.status).toBe(500);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ocorreu um erro interno.',
      },
    });
    expect(response.text).not.toContain('42501');
    expect(response.text).not.toContain('secret.supabase.co');
    expect(response.text).not.toContain('restricted_relation');
    expect(response.text).not.toContain('test-publishable-key');
  });
});

describe('GET /api/jobs/:id', () => {
  it('retorna 400 para um UUID inválido antes de consultar o Supabase', async () => {
    const { app, clientProvider } = createJobTestContext();

    const response = await request(app).get('/api/jobs/id-invalido');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados da requisição inválidos.',
        details: [],
      },
    });
    expect(clientProvider.createPublicClient).not.toHaveBeenCalled();
  });

  it('retorna uma vaga pública mapeada pelo id', async () => {
    const { app, eq, maybeSingle } = createJobTestContext();
    maybeSingle.mockResolvedValue({
      data: firstJobRow,
      error: null,
    });

    const response = await request(app).get(`/api/jobs/${firstJobRow.id}`);

    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(eq).toHaveBeenCalledWith('id', firstJobRow.id);
    expect(maybeSingle).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      data: {
        id: firstJobRow.id,
        companyId: firstJobRow.company_id,
        title: firstJobRow.title,
        city: firstJobRow.city,
        skill: firstJobRow.skill,
        deadline: firstJobRow.deadline,
        description: firstJobRow.description,
        createdAt: firstJobRow.created_at,
        company: {
          name: firstJobRow.company_name,
          phone: firstJobRow.company_phone,
        },
      },
    });
    expect(response.text).not.toContain('user_id');
    expect(response.text).not.toContain('privado@example.com');
    expect(response.text).not.toContain('Endereço privado');
  });

  it('retorna 404 JOB_NOT_FOUND quando a vaga não existe', async () => {
    const { app, maybeSingle } = createJobTestContext();
    maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await request(app).get(`/api/jobs/${firstJobRow.id}`);

    expect(response.status).toBe(404);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual({
      error: {
        code: 'JOB_NOT_FOUND',
        message: 'Vaga não encontrada.',
      },
    });
  });
});
