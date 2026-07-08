/**
 * @fileoverview Auth controller — xử lý HTTP requests cho module auth.
 */

import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  path: '/',
};

export const authController = {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response) {
    if (req.user) {
      await authService.logout(req.user.userId);
    }
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Đăng xuất thành công.' });
  },

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn.' });
      return;
    }

    const result = await authService.refresh(token);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  /**
   * GET /api/auth/me
   */
  async getMe(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.userId);
    res.json(user);
  },
};
