/**
 * @fileoverview Cấu hình biến môi trường cho ứng dụng.
 */

import 'dotenv/config';

/**
 * Parse CORS_ORIGIN: hỗ trợ nhiều origin phân cách bằng dấu phẩy.
 * Nếu chỉ có 1 origin, trả về string; nếu nhiều, trả về mảng string.
 */
const parseCorsOrigin = (): string | string[] => {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:3000';
  const origins = raw.split(',').map((o) => o.trim()).filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
};

export const env = {
  PORT: parseInt(process.env.PORT || '8080', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CORS_ORIGIN: parseCorsOrigin(),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
} as const;

