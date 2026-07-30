import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const passwordSchema = z.string().min(6).max(128);

export const authCredentialsSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();
