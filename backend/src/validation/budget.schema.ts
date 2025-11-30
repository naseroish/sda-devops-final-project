import { z } from 'zod';
import { dateStringSchema, objectIdSchema } from './shared.schema';

export const budgetBodySchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  limit: z.coerce.number().nonnegative(),
  walletId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  periodStart: dateStringSchema,
  periodEnd: dateStringSchema,
  notes: z.string().max(500).optional(),
});

export const budgetUpdateSchema = budgetBodySchema.partial().refine(
  (body) => Object.keys(body).length > 0,
  { message: 'Request body cannot be empty' }
);

export const budgetQuerySchema = z.object({
  walletId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  categories: z
    .union([z.string(), z.array(z.string())])
    .transform((value) =>
      Array.isArray(value)
        ? value
        : value.split(',').map((item) => item.trim()).filter(Boolean)
    )
    .optional(),
  activeOn: dateStringSchema.optional(),
  includeUsage: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

export const idParamSchema = z.object({ id: objectIdSchema });
