import { z } from 'zod';
import type { JobInput } from '../models/job.model.js';

export const jobIdParamsSchema = z
  .object({
    id: z.uuid(),
  })
  .strict();

function isRealDateOnly(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const deadlineSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isRealDateOnly);

export const jobInputSchema: z.ZodType<JobInput> = z
  .object({
    title: z.string().trim().min(3).max(120),
    city: z.string().trim().min(2).max(100),
    skill: z.string().trim().min(2).max(100),
    deadline: deadlineSchema,
    description: z.string().trim().min(10).max(2_000),
  })
  .strict();
