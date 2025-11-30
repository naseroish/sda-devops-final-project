import { z } from 'zod';
import { dateStringSchema, objectIdSchema } from './shared.schema';

export const goalBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().max(500).optional(),
  targetAmount: z.coerce.number().nonnegative(),
  currentAmount: z.coerce.number().nonnegative().optional(),
  walletId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  deadline: dateStringSchema.optional(),
});

export const goalUpdateSchema = goalBodySchema.partial().refine(
  (body) => Object.keys(body).length > 0,
  { message: 'Request body cannot be empty' }
);

export const goalQuerySchema = z.object({
  walletId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  activeOnly: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

export const goalAdjustSchema = z.object({
  amountDelta: z.coerce.number(),
});

export const idParamSchema = z.object({ id: objectIdSchema });
