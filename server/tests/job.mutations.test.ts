import type {
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import type { AppEnvironment } from '../src/config/env.js';
import type { SupabaseClientProvider } from '../src/config/supabase.js';
import type {
  JobInput,
  JobMutationRow,
} from '../src/models/job.model.js';

const testEnvironment: AppEnvironment = {
  NODE_ENV: 'test',
  PORT: 3001,
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
  CORS_ALLOWED_ORIGINS: ['http://localhost:5173'],
};

const authenticatedUser = {
  id: '28cfc905-e296-4ef5-88be-643425a17706',
  email: 'empresa@example.com',
} as User;

const resolvedCompanyId = '0061a3a7-6d70-4f8b-8341-5697879a4ea3';
const jobId = 'f4220fe3-196b-4d89-bcfe-c288db260d88';
const authorizationHeader = 'Bearer valid-test-token';

const validJobInput: JobInput = {
  title: 'Costureira para produção',
  city: 'Picos',
  skill: 'Máquina reta',
  deadline: '2026-08-20',
  description: 'Descrição completa da vaga.',
};

const mutationJobRow: JobMutationRow = {
  id: jobId,
  company_id: resolvedCompanyId,
  title: validJobInput.title,
  city: validJobInput.city,
  skill: validJobInput.skill,
  deadline: validJobInput.deadline,
  description: validJobInput.description,
  created_at: '2026-07-30T12:00:00.000Z',
  company_profiles: {
    name: 'Empresa',
    phone: '5589999999999',
  },
};

const expectedPublicJob = {
  id: mutationJobRow.id,
  companyId: mutationJobRow.company_id,
  title: mutationJobRow.title,
  city: mutationJobRow.city,
  skill: mutationJobRow.skill,
  deadline: mutationJobRow.deadline,
  description: mutationJobRow.description,
  createdAt: mutationJobRow.created_at,
  company: {
    name: 'Empresa',
    phone: '5589999999999',
  },
};

function createMutationTestContext() {
  const getUser = vi.fn().mockResolvedValue({
    data: {
      user: authenticatedUser,
    },
    error: null,
  });
  const verificationClient = {
    auth: {
      getUser,
    },
  } as unknown as SupabaseClient;

  const profileSelect = vi.fn();
  const profileEq = vi.fn();
  const profileMaybeSingle = vi.fn().mockResolvedValue({
    data: {
      id: resolvedCompanyId,
    },
    error: null,
  });
  const profileQuery = {
    select: profileSelect,
    eq: profileEq,
    maybeSingle: profileMaybeSingle,
  };

  profileSelect.mockReturnValue(profileQuery);
  profileEq.mockReturnValue(profileQuery);

  const jobsInsert = vi.fn();
  const jobsUpdate = vi.fn();
  const jobsDelete = vi.fn();
  const jobsSelect = vi.fn();
  const jobsEq = vi.fn();
  const jobsSingle = vi.fn();
  const jobsMaybeSingle = vi.fn();
  const jobsQuery = {
    insert: jobsInsert,
    update: jobsUpdate,
    delete: jobsDelete,
    select: jobsSelect,
    eq: jobsEq,
    single: jobsSingle,
    maybeSingle: jobsMaybeSingle,
  };

  jobsInsert.mockReturnValue(jobsQuery);
  jobsUpdate.mockReturnValue(jobsQuery);
  jobsDelete.mockReturnValue(jobsQuery);
  jobsSelect.mockReturnValue(jobsQuery);
  jobsEq.mockReturnValue(jobsQuery);

  const from = vi.fn((relation: string) => {
    if (relation === 'company_profiles') {
      return profileQuery;
    }

    if (relation === 'jobs') {
      return jobsQuery;
    }

    throw new Error('Relação inesperada no teste.');
  });
  const schema = vi.fn(() => ({ from }));
  const contextualClient = {
    schema,
  } as unknown as SupabaseClient;
  const publicClient = {} as SupabaseClient;
  const clientProvider: SupabaseClientProvider = {
    createAuthClient: vi.fn(() => verificationClient),
    createPublicClient: vi.fn(() => publicClient),
    createContextualClient: vi.fn(() => contextualClient),
  };
  const app = createApp({
    environment: testEnvironment,
    clientProvider,
  });

  return {
    app,
    clientProvider,
    from,
    getUser,
    jobsDelete,
    jobsEq,
    jobsInsert,
    jobsMaybeSingle,
    jobsSelect,
    jobsSingle,
    jobsUpdate,
    profileEq,
    profileMaybeSingle,
    profileSelect,
    schema,
  };
}

describe('POST /api/jobs', () => {
  it('retorna 401 quando o bearer está ausente', async () => {
    const { app, clientProvider, schema } = createMutationTestContext();

    const response = await request(app).post('/api/jobs').send(validJobInput);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Autenticação necessária.',
      },
    });
    expect(clientProvider.createContextualClient).not.toHaveBeenCalled();
    expect(schema).not.toHaveBeenCalled();
  });

  it('retorna 400 para um body inválido', async () => {
    const { app, schema } = createMutationTestContext();

    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', authorizationHeader)
      .send({
        ...validJobInput,
        deadline: '2026-02-30',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Dados da requisição inválidos.',
    });
    expect(response.body.error.details).toEqual(expect.any(Array));
    expect(schema).not.toHaveBeenCalled();
  });

  it.each(['companyId', 'company_id'])(
    'rejeita o campo de propriedade %s enviado pelo cliente',
    async (ownershipField) => {
      const { app, schema } = createMutationTestContext();

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', authorizationHeader)
        .send({
          ...validJobInput,
          [ownershipField]: 'client-controlled-company-id',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(schema).not.toHaveBeenCalled();
    }
  );

  it('retorna COMPANY_PROFILE_REQUIRED quando o usuário não possui empresa', async () => {
    const {
      app,
      jobsInsert,
      profileEq,
      profileMaybeSingle,
      profileSelect,
    } = createMutationTestContext();
    profileMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', authorizationHeader)
      .send(validJobInput);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'COMPANY_PROFILE_REQUIRED',
        message:
          'É necessário possuir um perfil de empresa para publicar vagas.',
      },
    });
    expect(profileSelect).toHaveBeenCalledWith('id');
    expect(profileEq).toHaveBeenCalledWith(
      'user_id',
      authenticatedUser.id
    );
    expect(jobsInsert).not.toHaveBeenCalled();
  });

  it('cria com o company_id resolvido no servidor e retorna 201 mapeado', async () => {
    const {
      app,
      clientProvider,
      from,
      getUser,
      jobsInsert,
      jobsSelect,
      jobsSingle,
      schema,
    } = createMutationTestContext();
    jobsSingle.mockResolvedValue({
      data: mutationJobRow,
      error: null,
    });

    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', authorizationHeader)
      .send({
        title: `  ${validJobInput.title}  `,
        city: ` ${validJobInput.city} `,
        skill: ` ${validJobInput.skill} `,
        deadline: validJobInput.deadline,
        description: `  ${validJobInput.description}  `,
      });

    expect(response.status).toBe(201);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(getUser).toHaveBeenCalledWith('valid-test-token');
    expect(
      clientProvider.createContextualClient
    ).toHaveBeenCalledWith('valid-test-token');
    expect(clientProvider.createPublicClient).not.toHaveBeenCalled();
    expect(schema).toHaveBeenCalledWith('public');
    expect(from).toHaveBeenCalledWith('company_profiles');
    expect(from).toHaveBeenCalledWith('jobs');
    expect(jobsInsert).toHaveBeenCalledWith({
      company_id: resolvedCompanyId,
      ...validJobInput,
    });
    expect(jobsSelect).toHaveBeenCalledWith(
      'id, company_id, title, city, skill, deadline, description, created_at, company_profiles(name, phone)'
    );
    expect(response.body).toEqual({ data: expectedPublicJob });
  });
});

describe('PUT /api/jobs/:id', () => {
  it('retorna 401 quando o bearer está ausente', async () => {
    const { app, schema } = createMutationTestContext();

    const response = await request(app).put(`/api/jobs/${jobId}`).send(
      validJobInput
    );

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTH_REQUIRED');
    expect(schema).not.toHaveBeenCalled();
  });

  it('retorna 400 para UUID inválido', async () => {
    const { app, schema } = createMutationTestContext();

    const response = await request(app)
      .put('/api/jobs/id-invalido')
      .set('Authorization', authorizationHeader)
      .send(validJobInput);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados da requisição inválidos.',
        details: [],
      },
    });
    expect(schema).not.toHaveBeenCalled();
  });

  it('rejeita body parcial', async () => {
    const { app, schema } = createMutationTestContext();

    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', authorizationHeader)
      .send({
        title: validJobInput.title,
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(schema).not.toHaveBeenCalled();
  });

  it('rejeita uma data inexistente no calendário', async () => {
    const { app, schema } = createMutationTestContext();

    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', authorizationHeader)
      .send({
        ...validJobInput,
        deadline: '2026-02-30',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(schema).not.toHaveBeenCalled();
  });

  it('não permite alterar company_id', async () => {
    const { app, jobsUpdate, schema } = createMutationTestContext();

    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', authorizationHeader)
      .send({
        ...validJobInput,
        company_id: 'client-controlled-company-id',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(jobsUpdate).not.toHaveBeenCalled();
    expect(schema).not.toHaveBeenCalled();
  });

  it('permite ao proprietário atualizar e retorna 200', async () => {
    const {
      app,
      clientProvider,
      jobsEq,
      jobsMaybeSingle,
      jobsUpdate,
    } = createMutationTestContext();
    jobsMaybeSingle.mockResolvedValue({
      data: mutationJobRow,
      error: null,
    });

    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', authorizationHeader)
      .send(validJobInput);

    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(clientProvider.createPublicClient).not.toHaveBeenCalled();
    expect(jobsUpdate).toHaveBeenCalledWith(validJobInput);
    expect(jobsEq).toHaveBeenNthCalledWith(1, 'id', jobId);
    expect(jobsEq).toHaveBeenNthCalledWith(
      2,
      'company_id',
      resolvedCompanyId
    );
    expect(response.body).toEqual({ data: expectedPublicJob });
  });

  it('retorna 404 uniforme para vaga de outra empresa', async () => {
    const { app, jobsMaybeSingle } = createMutationTestContext();
    jobsMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', authorizationHeader)
      .send(validJobInput);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'JOB_NOT_FOUND',
        message: 'Vaga não encontrada.',
      },
    });
  });

  it('retorna o mesmo 404 quando a vaga não existe', async () => {
    const { app, jobsMaybeSingle } = createMutationTestContext();
    jobsMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', authorizationHeader)
      .send(validJobInput);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('JOB_NOT_FOUND');
    expect(response.body.error.message).toBe('Vaga não encontrada.');
  });

  it('sanitiza falhas do Supabase como 500', async () => {
    const { app, jobsMaybeSingle } = createMutationTestContext();
    jobsMaybeSingle.mockResolvedValue({
      data: null,
      error: {
        code: '42501',
        message: 'permission denied at https://secret.supabase.co',
        details: 'SQL: restricted internal query',
        hint: 'test-secret-key',
      },
    });

    const response = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('Authorization', authorizationHeader)
      .send(validJobInput);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ocorreu um erro interno.',
      },
    });
    expect(response.text).not.toContain('42501');
    expect(response.text).not.toContain('secret.supabase.co');
    expect(response.text).not.toContain('restricted internal query');
    expect(response.text).not.toContain('test-secret-key');
  });
});

describe('DELETE /api/jobs/:id', () => {
  it('retorna 401 quando o bearer está ausente', async () => {
    const { app, schema } = createMutationTestContext();

    const response = await request(app).delete(`/api/jobs/${jobId}`);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('AUTH_REQUIRED');
    expect(schema).not.toHaveBeenCalled();
  });

  it('retorna 400 para UUID inválido', async () => {
    const { app, schema } = createMutationTestContext();

    const response = await request(app)
      .delete('/api/jobs/id-invalido')
      .set('Authorization', authorizationHeader);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados da requisição inválidos.',
        details: [],
      },
    });
    expect(schema).not.toHaveBeenCalled();
  });

  it('permite ao proprietário excluir e retorna 204 vazio', async () => {
    const {
      app,
      clientProvider,
      jobsDelete,
      jobsEq,
      jobsMaybeSingle,
      jobsSelect,
    } = createMutationTestContext();
    jobsMaybeSingle.mockResolvedValue({
      data: {
        id: jobId,
      },
      error: null,
    });

    const response = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set('Authorization', authorizationHeader);

    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(clientProvider.createPublicClient).not.toHaveBeenCalled();
    expect(jobsDelete).toHaveBeenCalledOnce();
    expect(jobsEq).toHaveBeenNthCalledWith(1, 'id', jobId);
    expect(jobsEq).toHaveBeenNthCalledWith(
      2,
      'company_id',
      resolvedCompanyId
    );
    expect(jobsSelect).toHaveBeenCalledWith('id');
  });

  it('retorna 404 uniforme para vaga de outra empresa', async () => {
    const { app, jobsMaybeSingle } = createMutationTestContext();
    jobsMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set('Authorization', authorizationHeader);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'JOB_NOT_FOUND',
        message: 'Vaga não encontrada.',
      },
    });
  });

  it('retorna o mesmo 404 quando a vaga não existe', async () => {
    const { app, jobsMaybeSingle } = createMutationTestContext();
    jobsMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set('Authorization', authorizationHeader);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('JOB_NOT_FOUND');
    expect(response.body.error.message).toBe('Vaga não encontrada.');
  });
});
