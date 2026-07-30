import type { RequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';

export const notFoundMiddleware: RequestHandler = (
  _request,
  _response,
  next
) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', 'Rota não encontrada.'));
};
