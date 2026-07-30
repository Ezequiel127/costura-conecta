import type { SupabaseClientProvider } from '../config/supabase.js';
import { AppError } from '../errors/AppError.js';
import type {
  PublicJobBoardRow,
  PublicJobResponse,
} from '../models/job.model.js';

const publicJobColumns =
  'id, company_id, title, city, skill, deadline, description, created_at, company_name, company_phone';

function mapPublicJob(row: PublicJobBoardRow): PublicJobResponse {
  return {
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    city: row.city,
    skill: row.skill,
    deadline: row.deadline,
    description: row.description,
    createdAt: new Date(row.created_at).toISOString(),
    company: {
      name: row.company_name,
      phone: row.company_phone,
    },
  };
}

function publicJobQueryError(): Error {
  return new Error('Falha ao consultar vagas públicas.');
}

export interface JobService {
  list(): Promise<PublicJobResponse[]>;
  findById(id: string): Promise<PublicJobResponse>;
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
  };
}
