import type { SupabaseClient, User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user: User;
        accessToken: string;
        supabase: SupabaseClient;
      };
    }
  }
}

export {};
