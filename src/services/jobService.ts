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
}

type CurrentCompanyResult =
  | { success: true; company: { id: string; name: string } }
  | { success: false; reason: JobServiceFailureReason };

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    city: row.city,
    skill: row.skill,
    deadline: row.deadline,
    description: row.description,
    createdAt: new Date(row.created_at).toLocaleDateString('pt-BR'),
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
    },
  };
}

export async function getJobs(): Promise<GetJobsResult> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, city, skill, deadline, description, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, reason: 'unexpected' };
    }

    return {
      success: true,
      jobs: (data as JobRow[]).map(mapJob),
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
      .select('id, title, city, skill, deadline, description, created_at')
      .single();

    if (error || !data) {
      return { success: false, reason: 'unexpected' };
    }

    return {
      success: true,
      job: mapJob(data as JobRow),
    };
  } catch {
    return { success: false, reason: 'unexpected' };
  }
}
