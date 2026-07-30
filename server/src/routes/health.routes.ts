import { Router } from 'express';

export const healthRoutes = Router();

healthRoutes.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'costura-conecta-api',
  });
});
