import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppEnvironment } from '../src/config/env.js';

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(() => ({})),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));

import { createSupabaseClientProvider } from '../src/config/supabase.js';

const testEnvironment: AppEnvironment = {
  NODE_ENV: 'test',
  PORT: 3001,
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
  CORS_ALLOWED_ORIGINS: ['http://localhost:5173'],
};

describe('configuração dos clientes Supabase', () => {
  beforeEach(() => {
    createClientMock.mockClear();
  });

  it('não cria sessão global e desativa persistência no cliente de Auth', () => {
    const provider = createSupabaseClientProvider(testEnvironment);

    expect(createClientMock).not.toHaveBeenCalled();

    provider.createAuthClient();

    expect(createClientMock).toHaveBeenCalledWith(
      testEnvironment.SUPABASE_URL,
      testEnvironment.SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  });

  it('cria o cliente contextual com o bearer e sem persistência', () => {
    const provider = createSupabaseClientProvider(testEnvironment);

    provider.createContextualClient('valid-test-token');

    expect(createClientMock).toHaveBeenCalledWith(
      testEnvironment.SUPABASE_URL,
      testEnvironment.SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            Authorization: 'Bearer valid-test-token',
          },
        },
      }
    );
  });
});
