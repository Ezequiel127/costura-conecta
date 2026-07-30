import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError.js';

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next
) => {
  void _next;

  if (error instanceof AppError) {
    const errorBody: {
      code: string;
      message: string;
      details?: unknown;
    } = {
      code: error.code,
      message: error.message,
    };

    if (error.details !== undefined) {
      errorBody.details = error.details;
    }

    response.status(error.statusCode).json({ error: errorBody });
    return;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocorreu um erro interno.',
    },
  });
};
