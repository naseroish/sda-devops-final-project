import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, { message: 'Invalid identifier' });

export const dateStringSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Invalid date' });
