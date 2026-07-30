import type { RequestHandler } from 'express';
import type { z } from 'zod';
import { AppError } from '../errors/AppError.js';

interface ValidationDetail {
  field: string;
  message: string;
}

export function validateBody(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      const details: ValidationDetail[] = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));

      next(
        new AppError(
          400,
          'VALIDATION_ERROR',
          'Dados da requisição inválidos.',
          details
        )
      );
      return;
    }

    request.body = result.data;
    next();
  };
}
