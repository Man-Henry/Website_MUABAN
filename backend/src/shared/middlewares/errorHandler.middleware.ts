/**
 * @fileoverview Global error handler middleware.
 */

import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // AppError (lỗi nghiệp vụ, có status code rõ ràng)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Multer errors
  if (err.name === 'MulterError') {
    res.status(400).json({ message: `Lỗi upload: ${err.message}` });
    return;
  }

  // Lỗi không xác định
  console.error('❌ Unhandled Error:', err);
  res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại.' });
};
