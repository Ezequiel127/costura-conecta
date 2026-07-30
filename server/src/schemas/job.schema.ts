import { z } from 'zod';

export const jobIdParamsSchema = z
  .object({
    id: z.uuid(),
  })
  .strict();
