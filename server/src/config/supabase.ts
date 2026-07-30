import {
  createClient,
  type SupabaseClient,
} from '@supabase/supabase-js';
import type { AppEnvironment } from './env.js';

const serverAuthOptions = {
  autoRefreshToken: false,
  persistSession: false,
  detectSessionInUrl: false,
} as const;

export interface SupabaseClientProvider {
  createAuthClient(): SupabaseClient;
  createPublicClient(): SupabaseClient;
  createContextualClient(accessToken: string): SupabaseClient;
}

export function createSupabaseClientProvider(
  environment: AppEnvironment
): SupabaseClientProvider {
  function createStatelessClient(): SupabaseClient {
    return createClient(
      environment.SUPABASE_URL,
      environment.SUPABASE_PUBLISHABLE_KEY,
      {
        auth: serverAuthOptions,
      }
    );
  }

  return {
    createAuthClient() {
      return createStatelessClient();
    },

    createPublicClient() {
      return createStatelessClient();
    },

    createContextualClient(accessToken: string) {
      return createClient(
        environment.SUPABASE_URL,
        environment.SUPABASE_PUBLISHABLE_KEY,
        {
          auth: serverAuthOptions,
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }
      );
    },
  };
}
