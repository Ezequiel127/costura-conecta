import type { RequestHandler } from 'express';
import type { SupabaseClientProvider } from '../config/supabase.js';
import { AppError } from '../errors/AppError.js';

const bearerTokenPattern = /^Bearer ([^\s]+)$/;

function invalidTokenError(): AppError {
  return new AppError(
    401,
    'INVALID_TOKEN',
    'Token de acesso inválido ou expirado.'
  );
}

export function createAuthMiddleware(
  clientProvider: SupabaseClientProvider
): RequestHandler {
  return async (request, _response, next) => {
    const authorizationHeader = request.get('authorization');

    if (authorizationHeader === undefined) {
      next(
        new AppError(
          401,
          'AUTH_REQUIRED',
          'Autenticação necessária.'
        )
      );
      return;
    }

    const bearerMatch = bearerTokenPattern.exec(authorizationHeader);

    if (!bearerMatch) {
      next(invalidTokenError());
      return;
    }

    const accessToken = bearerMatch[1];
    const verificationClient = clientProvider.createAuthClient();
    const {
      data: { user },
      error,
    } = await verificationClient.auth.getUser(accessToken);

    if (error || !user) {
      next(invalidTokenError());
      return;
    }

    request.auth = {
      user,
      accessToken,
      supabase: clientProvider.createContextualClient(accessToken),
    };

    next();
  };
}
