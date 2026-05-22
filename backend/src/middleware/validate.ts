import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);
      (req as any)[source] = data;
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: err.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
};
