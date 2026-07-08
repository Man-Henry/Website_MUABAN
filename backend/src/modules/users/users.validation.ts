/**
 * @fileoverview Users validation schemas.
 */

import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
  newPassword: z
    .string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự.')
    .regex(/[A-Z]/, 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa.')
    .regex(/[0-9]/, 'Mật khẩu mới phải chứa ít nhất 1 số.'),
});
