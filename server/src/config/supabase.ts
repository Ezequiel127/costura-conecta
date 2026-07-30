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
  createContextualClient(accessToken: string): SupabaseClient;
}

export function createSupabaseClientProvider(
  environment: AppEnvironment
): SupabaseClientProvider {
  return {
    createAuthClient() {
      return createClient(
        environment.SUPABASE_URL,
        environment.SUPABASE_PUBLISHABLE_KEY,
        {
          auth: serverAuthOptions,
        }
      );
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
