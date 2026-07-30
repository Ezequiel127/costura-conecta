export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  id: string;
  email: string | null;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number | null;
}

export interface RegisterResponse {
  user: AuthUserResponse | null;
  session: AuthSessionResponse | null;
  emailConfirmationRequired: boolean;
}

export interface LoginResponse {
  user: AuthUserResponse;
  session: AuthSessionResponse;
}
