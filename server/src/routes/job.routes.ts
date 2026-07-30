import { Router } from 'express';
import type { JobController } from '../controllers/job.controller.js';
import { validateParams } from '../middlewares/validate.middleware.js';
import { jobIdParamsSchema } from '../schemas/job.schema.js';

export function createJobRoutes(controller: JobController): Router {
  const jobRoutes = Router();

  jobRoutes.get('/', controller.list);
  jobRoutes.get(
    '/:id',
    validateParams(jobIdParamsSchema),
    controller.getById
  );

  return jobRoutes;
}
