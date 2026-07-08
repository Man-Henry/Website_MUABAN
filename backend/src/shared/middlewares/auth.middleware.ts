/**
 * @fileoverview Middleware xác thực JWT.
 * Lấy token từ header Authorization: Bearer <token>,
 * verify và gắn user vào req.user.
 */

import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../errors/AppError.js';

/**
 * Middleware yêu cầu xác thực.
 * Nếu không có token hoặc token không hợp lệ → trả 401.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Bạn chưa đăng nhập hoặc phiên đã hết hạn.');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError('Token không hợp lệ hoặc đã hết hạn.');
  }
};

/**
 * Middleware xác thực tuỳ chọn.
 * Nếu có token hợp lệ → gắn user, nếu không → tiếp tục (req.user = undefined).
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Token không hợp lệ → bỏ qua, tiếp tục như guest
    }
  }
  next();
};
