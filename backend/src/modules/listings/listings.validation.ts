/**
 * @fileoverview Listings validation schemas.
 */

import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề.').max(200),
  category: z.enum(['fashion', 'electronics', 'furniture', 'household', 'other'], {
    message: 'Danh mục không hợp lệ.',
  }),
  description: z.string().min(10, 'Mô tả cần ít nhất 10 ký tự.').max(2000),
  price: z.string().transform(Number).pipe(z.number().positive('Giá phải là số dương.')),
  negotiable: z.string().transform((v) => v === 'true'),
  condition: z.enum(['new', 'like-new', 'good', 'fair'], {
    message: 'Tình trạng không hợp lệ.',
  }),
});

export const updateListingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.enum(['fashion', 'electronics', 'furniture', 'household', 'other']).optional(),
  description: z.string().min(10).max(2000).optional(),
  price: z.string().transform(Number).pipe(z.number().positive()).optional(),
  negotiable: z.string().transform((v) => v === 'true').optional(),
  condition: z.enum(['new', 'like-new', 'good', 'fair']).optional(),
  removedImageIds: z.string().optional(), // JSON string array
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'sold', 'hidden'], {
    message: 'Trạng thái không hợp lệ.',
  }),
});

export const listingQuerySchema = z.object({
  search: z.string().optional(),
  category: z.enum(['fashion', 'electronics', 'furniture', 'household', 'other']).optional(),
  condition: z.enum(['new', 'like-new', 'good', 'fair']).optional(),
  minPrice: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
  sort: z.enum(['newest', 'oldest', 'price-asc', 'price-desc']).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(50)).optional(),
});
