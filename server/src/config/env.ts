import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.string().url()).min(1)),
  AUTH_REDIRECT_URL: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().url().optional()
  ),
});

export type AppEnvironment = z.infer<typeof environmentSchema>;

export function loadEnvironment(
  source: NodeJS.ProcessEnv = process.env
): AppEnvironment {
  const result = environmentSchema.safeParse(source);

  if (!result.success) {
    const invalidVariables = [
      ...new Set(
        result.error.issues
          .map((issue) => issue.path[0])
          .filter((path): path is string => typeof path === 'string')
      ),
    ];

    throw new Error(
      `Variáveis de ambiente inválidas: ${invalidVariables.join(', ')}.`
    );
  }

  return result.data;
}
