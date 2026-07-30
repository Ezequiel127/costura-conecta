import type { SupabaseClientProvider } from '../config/supabase.js';
import { AppError } from '../errors/AppError.js';
import type {
  JobCompanyRow,
  JobInput,
  JobMutationContext,
  JobMutationRow,
  JobRow,
  PublicJobBoardRow,
  PublicJobResponse,
} from '../models/job.model.js';

const publicJobColumns =
  'id, company_id, title, city, skill, deadline, description, created_at, company_name, company_phone';
const mutationJobColumns =
  'id, company_id, title, city, skill, deadline, description, created_at, company_profiles(name, phone)';

function mapJob(
  row: JobRow,
  company: JobCompanyRow
): PublicJobResponse {
  return {
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    city: row.city,
    skill: row.skill,
    deadline: row.deadline,
    description: row.description,
    createdAt: new Date(row.created_at).toISOString(),
    company,
  };
}

function mapPublicJob(row: PublicJobBoardRow): PublicJobResponse {
  return mapJob(row, {
    name: row.company_name,
    phone: row.company_phone,
  });
}

function mapMutationJob(row: JobMutationRow): PublicJobResponse {
  const relatedCompany = Array.isArray(row.company_profiles)
    ? row.company_profiles[0]
    : row.company_profiles;

  return mapJob(
    row,
    relatedCompany ?? {
      name: null,
      phone: null,
    }
  );
}

function publicJobQueryError(): Error {
  return new Error('Falha ao consultar vagas públicas.');
}

function protectedJobQueryError(): Error {
  return new Error('Falha ao processar a operação da vaga.');
}

async function resolveCompanyProfileId({
  userId,
  supabase,
}: JobMutationContext): Promise<string> {
  let queryResult;

  try {
    queryResult = await supabase
      .schema('public')
      .from('company_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
  } catch {
    throw protectedJobQueryError();
  }

  if (queryResult.error) {
    throw protectedJobQueryError();
  }

  if (!queryResult.data) {
    throw new AppError(
      400,
      'COMPANY_PROFILE_REQUIRED',
      'É necessário possuir um perfil de empresa para publicar vagas.'
    );
  }

  const companyProfile = queryResult.data as { id?: unknown };

  if (typeof companyProfile.id !== 'string') {
    throw protectedJobQueryError();
  }

  return companyProfile.id;
}

export interface JobService {
  list(): Promise<PublicJobResponse[]>;
  findById(id: string): Promise<PublicJobResponse>;
  create(
    input: JobInput,
    context: JobMutationContext
  ): Promise<PublicJobResponse>;
  update(
    id: string,
    input: JobInput,
    context: JobMutationContext
  ): Promise<PublicJobResponse>;
  remove(id: string, context: JobMutationContext): Promise<void>;
}

export function createJobService(
  clientProvider: SupabaseClientProvider
): JobService {
  return {
    async list() {
      const client = clientProvider.createPublicClient();
      let queryResult;

      try {
        queryResult = await client
          .schema('public')
          .from('public_job_board')
          .select(publicJobColumns)
          .order('created_at', { ascending: false });
      } catch {
        throw publicJobQueryError();
      }

      if (queryResult.error) {
        throw publicJobQueryError();
      }

      const rows = (queryResult.data ?? []) as PublicJobBoardRow[];

      return [...rows]
        .sort(
          (first, second) =>
            Date.parse(second.created_at) - Date.parse(first.created_at)
        )
        .map(mapPublicJob);
    },

    async findById(id) {
      const client = clientProvider.createPublicClient();
      let queryResult;

      try {
        queryResult = await client
          .schema('public')
          .from('public_job_board')
          .select(publicJobColumns)
          .eq('id', id)
          .maybeSingle();
      } catch {
        throw publicJobQueryError();
      }

      if (queryResult.error) {
        throw publicJobQueryError();
      }

      if (!queryResult.data) {
        throw new AppError(
          404,
          'JOB_NOT_FOUND',
          'Vaga não encontrada.'
        );
      }

      return mapPublicJob(queryResult.data as PublicJobBoardRow);
    },

    async create(input, context) {
      const companyId = await resolveCompanyProfileId(context);
      let queryResult;

      try {
        queryResult = await context.supabase
          .schema('public')
          .from('jobs')
          .insert({
            company_id: companyId,
            title: input.title,
            city: input.city,
            skill: input.skill,
            deadline: input.deadline,
            description: input.description,
          })
          .select(mutationJobColumns)
          .single();
      } catch {
        throw protectedJobQueryError();
      }

      if (queryResult.error || !queryResult.data) {
        throw protectedJobQueryError();
      }

      return mapMutationJob(queryResult.data as JobMutationRow);
    },

    async update(id, input, context) {
      const companyId = await resolveCompanyProfileId(context);
      let queryResult;

      try {
        queryResult = await context.supabase
          .schema('public')
          .from('jobs')
          .update({
            title: input.title,
            city: input.city,
            skill: input.skill,
            deadline: input.deadline,
            description: input.description,
          })
          .eq('id', id)
          .eq('company_id', companyId)
          .select(mutationJobColumns)
          .maybeSingle();
      } catch {
        throw protectedJobQueryError();
      }

      if (queryResult.error) {
        throw protectedJobQueryError();
      }

      if (!queryResult.data) {
        throw new AppError(
          404,
          'JOB_NOT_FOUND',
          'Vaga não encontrada.'
        );
      }

      return mapMutationJob(queryResult.data as JobMutationRow);
    },

    async remove(id, context) {
      const companyId = await resolveCompanyProfileId(context);
      let queryResult;

      try {
        queryResult = await context.supabase
          .schema('public')
          .from('jobs')
          .delete()
          .eq('id', id)
          .eq('company_id', companyId)
          .select('id')
          .maybeSingle();
      } catch {
        throw protectedJobQueryError();
      }

      if (queryResult.error) {
        throw protectedJobQueryError();
      }

      if (!queryResult.data) {
        throw new AppError(
          404,
          'JOB_NOT_FOUND',
          'Vaga não encontrada.'
        );
      }
    },
  };
}
