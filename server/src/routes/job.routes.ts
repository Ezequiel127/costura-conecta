import { Router, type RequestHandler } from 'express';
import type { JobController } from '../controllers/job.controller.js';
import {
  validateBody,
  validateParams,
} from '../middlewares/validate.middleware.js';
import {
  jobIdParamsSchema,
  jobInputSchema,
} from '../schemas/job.schema.js';

export function createJobRoutes(
  controller: JobController,
  authenticate: RequestHandler
): Router {
  const jobRoutes = Router();

  jobRoutes.get('/', controller.list);
  jobRoutes.get(
    '/:id',
    validateParams(jobIdParamsSchema),
    controller.getById
  );
  jobRoutes.post(
    '/',
    authenticate,
    validateBody(jobInputSchema),
    controller.create
  );
  jobRoutes.put(
    '/:id',
    authenticate,
    validateParams(jobIdParamsSchema),
    validateBody(jobInputSchema),
    controller.update
  );
  jobRoutes.delete(
    '/:id',
    authenticate,
    validateParams(jobIdParamsSchema),
    controller.remove
  );

  return jobRoutes;
}
