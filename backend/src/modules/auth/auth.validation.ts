/**
 * @fileoverview Zod validation schemas cho Auth module.
 */

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa.')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số.'),
  displayName: z
    .string()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự.')
    .max(50, 'Tên hiển thị không quá 50 ký tự.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
