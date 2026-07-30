import { Router } from 'express';
import { healthRoutes } from './health.routes.js';

export const apiRoutes = Router();

apiRoutes.use(healthRoutes);
