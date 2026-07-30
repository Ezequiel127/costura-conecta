import type { RequestHandler } from 'express';
import type { JobService } from '../services/job.service.js';

export interface JobController {
  list: RequestHandler;
  getById: RequestHandler;
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
  };
}
