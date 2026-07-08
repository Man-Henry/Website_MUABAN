/**
 * @fileoverview Conversations routes.
 */

import { Router } from 'express';
import { conversationsController } from './conversations.controller.js';
import { requireAuth } from '../../shared/middlewares/auth.middleware.js';
import { validateBody } from '../../shared/middlewares/validate.middleware.js';
import { startConversationSchema, sendMessageSchema } from './conversations.validation.js';

const router = Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(requireAuth);

router.get('/', conversationsController.getConversations);
router.post('/', validateBody(startConversationSchema), conversationsController.startConversation);
router.get('/:id', conversationsController.getConversation);
router.get('/:id/messages', conversationsController.getMessages);
router.post('/:id/messages', validateBody(sendMessageSchema), conversationsController.sendMessage);
router.patch('/:id/read', conversationsController.markAsRead);

export default router;
