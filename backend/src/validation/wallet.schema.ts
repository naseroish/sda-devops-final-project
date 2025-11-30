import { z } from 'zod';
import { objectIdSchema } from './shared.schema';

const walletMemberSchema = z.object({
  userId: objectIdSchema,
  role: z.enum(['owner', 'editor', 'viewer']).optional().default('viewer'),
});

export const walletBodySchema = z.object({
  name: z.string().min(1),
  ownerId: objectIdSchema,
  members: z.array(walletMemberSchema).optional(),
  currency: z.string().length(3).optional(),
});

export const walletUpdateSchema = walletBodySchema.partial().refine(
  (body) => Object.keys(body).length > 0,
  { message: 'Request body cannot be empty' }
);

export const walletQuerySchema = z.object({
  ownerId: objectIdSchema.optional(),
});

export const memberBodySchema = walletMemberSchema;

export const walletIdSchema = z.object({ id: objectIdSchema });
export const walletMemberParamsSchema = z.object({
  id: objectIdSchema,
  userId: objectIdSchema,
});
