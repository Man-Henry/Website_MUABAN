/**
 * @fileoverview Conversations validation.
 */

import { z } from 'zod';

export const startConversationSchema = z.object({
  recipientId: z.string().min(1, 'Thiếu ID người nhận.'),
  content: z.string().min(1, 'Vui lòng nhập nội dung tin nhắn.').max(2000),
  listingId: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Vui lòng nhập nội dung tin nhắn.').max(2000),
});
