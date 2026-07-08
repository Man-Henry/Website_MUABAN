/**
 * @fileoverview Middleware validate request bằng Zod schema.
 */

import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../errors/AppError.js';

/**
 * Tạo middleware validate request body theo Zod schema.
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((e: { message: string }) => e.message).join('. ');
      throw new ValidationError(message);
    }
    req.body = result.data;
    next();
  };
};

/**
 * Tạo middleware validate query params theo Zod schema.
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const message = result.error.issues.map((e: { message: string }) => e.message).join('. ');
      throw new ValidationError(message);
    }
    req.query = result.data as typeof req.query;
    next();
  };
};
