import type { Job } from '../types';
import { supabase } from '../supabaseClient';
import { getCurrentCompanyProfile } from './companyProfileService';

export interface JobInput {
  title: string;
  city: string;
  skill: string;
  deadline: string;
  description: string;
}

type JobServiceFailureReason =
  | 'unauthenticated'
  | 'missing_company_profile'
  | 'unexpected';

export type GetJobsResult =
  | { success: true; jobs: Job[] }
  | { success: false; reason: 'unexpected' };

export type CreateJobResult =
  | { success: true; job: Job }
  | { success: false; reason: JobServiceFailureReason };

interface JobRow {
  id: string;
  title: string;
  city: string;
  skill: string;
  deadline: string;
  description: string;
  created_at: string;
  company_profiles?: unknown;
}

interface JobCompanyRow {
  name: string;
  phone?: string | null;
}

type CurrentCompanyResult =
  | { success: true; company: JobCompanyRow & { id: string } }
  | { success: false; reason: JobServiceFailureReason };

function isJobCompanyRow(value: unknown): value is JobCompanyRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const company = value as Record<string, unknown>;

  return (
    typeof company.name === 'string' &&
    (company.phone === undefined ||
      company.phone === null ||
      typeof company.phone === 'string')
  );
}

function getRelatedCompany(value: unknown): JobCompanyRow | null {
  if (Array.isArray(value)) {
    return value.find(isJobCompanyRow) ?? null;
  }

  return isJobCompanyRow(value) ? value : null;
}

function mapJob(row: JobRow, fallbackCompany?: JobCompanyRow): Job {
  const company = getRelatedCompany(row.company_profiles) ?? fallbackCompany;
  const companyName = company?.name.trim();
  const companyPhone =
    typeof company?.phone === 'string' ? company.phone.trim() : undefined;

  return {
    id: row.id,
    title: row.title,
    city: row.city,
    skill: row.skill,
    deadline: row.deadline,
    description: row.description,
    createdAt: new Date(row.created_at).toLocaleDateString('pt-BR'),
    companyName: companyName || undefined,
    companyPhone: companyPhone || undefined,
  };
}

async function getCurrentCompany(): Promise<CurrentCompanyResult> {
  const result = await getCurrentCompanyProfile();

  if (!result.success) {
    return result;
  }

  if (!result.profile) {
    return { success: false, reason: 'missing_company_profile' };
  }

  return {
    success: true,
    company: {
      id: result.profile.id,
      name: result.profile.name,
      phone: result.profile.phone,
    },
  };
}

export async function getJobs(): Promise<GetJobsResult> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(
        'id, title, city, skill, deadline, description, created_at, company_profiles(name, phone)'
      )
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, reason: 'unexpected' };
    }

    return {
      success: true,
      jobs: (data as JobRow[]).map((row) => mapJob(row)),
    };
  } catch {
    return { success: false, reason: 'unexpected' };
  }
}

export async function createJob(input: JobInput): Promise<CreateJobResult> {
  try {
    const currentCompany = await getCurrentCompany();

    if (!currentCompany.success) {
      return currentCompany;
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        company_id: currentCompany.company.id,
        title: input.title.trim(),
        city: input.city.trim(),
        skill: input.skill.trim(),
        deadline: input.deadline,
        description: input.description.trim(),
      })
      .select(
        'id, title, city, skill, deadline, description, created_at, company_profiles(name, phone)'
      )
      .single();

    if (error || !data) {
      return { success: false, reason: 'unexpected' };
    }

    return {
      success: true,
      job: mapJob(data as JobRow, currentCompany.company),
    };
  } catch {
    return { success: false, reason: 'unexpected' };
  }
}
