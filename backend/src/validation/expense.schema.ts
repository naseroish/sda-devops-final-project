import { z } from 'zod';
import { dateStringSchema, objectIdSchema } from './shared.schema';

const csvToArray = (value: string | string[]) => {
  if (Array.isArray(value)) return value;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const stringArraySchema = z
  .union([z.string(), z.array(z.string())])
  .transform(csvToArray);

export const expenseQuerySchema = z.object({
  walletId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  categories: stringArraySchema.optional(),
  tags: stringArraySchema.optional(),
  search: z.string().optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  limit: z.coerce.number().min(1).max(500).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});

export const expenseSummaryQuerySchema = z.object({
  walletId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  categories: stringArraySchema.optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
});

export const expenseBodySchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().nonnegative(),
  category: z.string().min(1),
  date: z.coerce.date().optional(),
  currency: z.string().length(3).optional(),
  note: z.string().max(500).optional(),
  tags: z.array(z.string().min(1)).optional().default([]),
  walletId: objectIdSchema.optional(),
  userId: objectIdSchema.optional(),
  isRecurring: z.coerce.boolean().optional(),
  receiptUrl: z.string().url().optional(),
});

export const expenseUpdateSchema = expenseBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'Request body cannot be empty' }
);

export const idParamSchema = z.object({
  id: objectIdSchema,
});
