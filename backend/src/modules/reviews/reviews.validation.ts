/**
 * @fileoverview Reviews validation.
 */

import { z } from 'zod';

export const createReviewSchema = z.object({
  sellerId: z.string().min(1, 'Thiếu ID người bán.'),
  rating: z.number().int().min(1, 'Điểm tối thiểu là 1.').max(5, 'Điểm tối đa là 5.'),
  comment: z.string().min(1, 'Vui lòng nhập nhận xét.').max(1000),
});
