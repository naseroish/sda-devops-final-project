import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

const formatError = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

export const validateBody = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: formatError(error) });
      }
      next(error);
    }
  };

export const validateQuery = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: formatError(error) });
      }
      next(error);
    }
  };

export const validateParams = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: formatError(error) });
      }
      next(error);
    }
  };
