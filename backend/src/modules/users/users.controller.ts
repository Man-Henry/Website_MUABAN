/**
 * @fileoverview Users controller.
 */

import type { Request, Response } from 'express';
import { usersService } from './users.service.js';

export const usersController = {
  async getProfile(req: Request, res: Response) {
    const user = await usersService.getProfile(req.user!.userId);
    res.json(user);
  },

  async getPublicProfile(req: Request, res: Response) {
    const user = await usersService.getPublicProfile(req.params.userId as string);
    res.json(user);
  },

  async updateProfile(req: Request, res: Response) {
    const user = await usersService.updateProfile(req.user!.userId, req.body);
    res.json(user);
  },

  async uploadAvatar(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).json({ message: 'Vui lòng chọn ảnh đại diện.' });
      return;
    }
    const result = await usersService.uploadAvatar(req.user!.userId, req.file.buffer);
    res.json(result);
  },

  async changePassword(req: Request, res: Response) {
    await usersService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
    res.json({ message: 'Đổi mật khẩu thành công.' });
  },

  async getUserListings(req: Request, res: Response) {
    const listings = await usersService.getUserListings(req.params.userId as string);
    res.json(listings);
  },
};
