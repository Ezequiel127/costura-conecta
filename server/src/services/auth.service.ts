import type { Session, User } from '@supabase/supabase-js';
import type { AppEnvironment } from '../config/env.js';
import type { SupabaseClientProvider } from '../config/supabase.js';
import { AppError } from '../errors/AppError.js';
import type {
  AuthCredentials,
  AuthSessionResponse,
  AuthUserResponse,
  LoginResponse,
  RegisterResponse,
} from '../models/auth.model.js';

const registrationConflictCodes = new Set([
  'email_exists',
  'user_already_exists',
]);

const rejectedRegistrationCodes = new Set([
  'email_address_invalid',
  'signup_disabled',
  'weak_password',
]);

function mapUser(user: User): AuthUserResponse {
  return {
    id: user.id,
    email: user.email ?? null,
  };
}

function mapSession(session: Session): AuthSessionResponse {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    tokenType: session.token_type,
    expiresIn: session.expires_in,
    expiresAt: session.expires_at ?? null,
  };
}

export interface AuthService {
  register(credentials: AuthCredentials): Promise<RegisterResponse>;
  login(credentials: AuthCredentials): Promise<LoginResponse>;
}

export function createAuthService(
  environment: AppEnvironment,
  clientProvider: SupabaseClientProvider
): AuthService {
  return {
    async register(credentials) {
      const client = clientProvider.createAuthClient();
      const signUpOptions = environment.AUTH_REDIRECT_URL
        ? {
            emailRedirectTo: environment.AUTH_REDIRECT_URL,
          }
        : undefined;

      const { data, error } = await client.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: signUpOptions,
      });

      if (error) {
        if (
          error.code !== undefined &&
          registrationConflictCodes.has(error.code)
        ) {
          throw new AppError(
            409,
            'AUTH_USER_CONFLICT',
            'Não foi possível concluir o cadastro.'
          );
        }

        if (
          error.code !== undefined &&
          rejectedRegistrationCodes.has(error.code)
        ) {
          throw new AppError(
            400,
            'REGISTRATION_REJECTED',
            'Não foi possível concluir o cadastro.'
          );
        }

        if (error.status === 429) {
          throw new AppError(
            429,
            'AUTH_RATE_LIMITED',
            'Muitas tentativas. Tente novamente mais tarde.'
          );
        }

        throw error;
      }

      return {
        user: data.user ? mapUser(data.user) : null,
        session: data.session ? mapSession(data.session) : null,
        emailConfirmationRequired: data.session === null,
      };
    },

    async login(credentials) {
      const client = clientProvider.createAuthClient();
      const { data, error } = await client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        if (error.code === 'invalid_credentials') {
          throw new AppError(
            401,
            'INVALID_CREDENTIALS',
            'E-mail ou senha inválidos.'
          );
        }

        if (error.code === 'email_not_confirmed') {
          throw new AppError(
            401,
            'EMAIL_NOT_CONFIRMED',
            'Confirme seu e-mail antes de entrar.'
          );
        }

        if (error.status === 429) {
          throw new AppError(
            429,
            'AUTH_RATE_LIMITED',
            'Muitas tentativas. Tente novamente mais tarde.'
          );
        }

        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('Resposta de autenticação incompleta.');
      }

      return {
        user: mapUser(data.user),
        session: mapSession(data.session),
      };
    },
  };
}
