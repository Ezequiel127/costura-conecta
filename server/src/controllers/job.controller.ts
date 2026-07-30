import type { Request, RequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';
import type {
  JobInput,
  JobMutationContext,
} from '../models/job.model.js';
import type { JobService } from '../services/job.service.js';

export interface JobController {
  list: RequestHandler;
  getById: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
}

function getMutationContext(request: Request): JobMutationContext {
  if (!request.auth) {
    throw new AppError(
      401,
      'AUTH_REQUIRED',
      'Autenticação necessária.'
    );
  }

  return {
    userId: request.auth.user.id,
    supabase: request.auth.supabase,
  };
}

export function createJobController(
  jobService: JobService
): JobController {
  return {
    list: async (_request, response) => {
      response.set('Cache-Control', 'no-store');
      const jobs = await jobService.list();

      response.status(200).json({ data: jobs });
    },

    getById: async (request, response) => {
      response.set('Cache-Control', 'no-store');
      const jobId = request.params.id as string;
      const job = await jobService.findById(jobId);

      response.status(200).json({ data: job });
    },

    create: async (request, response) => {
      response.set('Cache-Control', 'no-store');
      const job = await jobService.create(
        request.body as JobInput,
        getMutationContext(request)
      );

      response.status(201).json({ data: job });
    },

    update: async (request, response) => {
      response.set('Cache-Control', 'no-store');
      const jobId = request.params.id as string;
      const job = await jobService.update(
        jobId,
        request.body as JobInput,
        getMutationContext(request)
      );

      response.status(200).json({ data: job });
    },

    remove: async (request, response) => {
      response.set('Cache-Control', 'no-store');
      const jobId = request.params.id as string;
      await jobService.remove(jobId, getMutationContext(request));

      response.status(204).send();
    },
  };
}
