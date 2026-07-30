import type { SupabaseClient } from '@supabase/supabase-js';

export interface JobRow {
  id: string;
  company_id: string;
  title: string;
  city: string;
  skill: string;
  deadline: string;
  description: string;
  created_at: string;
}

export interface PublicJobBoardRow extends JobRow {
  company_name: string | null;
  company_phone: string | null;
}

export interface JobCompanyRow {
  name: string | null;
  phone: string | null;
}

export interface JobMutationRow extends JobRow {
  company_profiles: JobCompanyRow | JobCompanyRow[] | null;
}

export interface JobInput {
  title: string;
  city: string;
  skill: string;
  deadline: string;
  description: string;
}

export interface JobMutationContext {
  userId: string;
  supabase: SupabaseClient;
}

export interface PublicJobResponse {
  id: string;
  companyId: string;
  title: string;
  city: string;
  skill: string;
  deadline: string;
  description: string;
  createdAt: string;
  company: {
    name: string | null;
    phone: string | null;
  };
}
