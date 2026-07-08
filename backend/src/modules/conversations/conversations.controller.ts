/**
 * @fileoverview Conversations controller.
 */

import type { Request, Response } from 'express';
import { conversationsService } from './conversations.service.js';

export const conversationsController = {
  async getConversations(req: Request, res: Response) {
    const conversations = await conversationsService.getConversations(req.user!.userId);
    res.json(conversations);
  },

  async getConversation(req: Request, res: Response) {
    const conversation = await conversationsService.getConversation(req.params.id as string, req.user!.userId);
    res.json(conversation);
  },

  async getMessages(req: Request, res: Response) {
    const before = req.query.before as string | undefined;
    const messages = await conversationsService.getMessages(req.params.id as string, req.user!.userId, before);
    res.json(messages);
  },

  async sendMessage(req: Request, res: Response) {
    const message = await conversationsService.sendMessage(req.params.id as string, req.user!.userId, req.body.content);
    res.status(201).json(message);
  },

  async startConversation(req: Request, res: Response) {
    const conversation = await conversationsService.startConversation(req.user!.userId, req.body);
    res.status(201).json(conversation);
  },

  async markAsRead(req: Request, res: Response) {
    await conversationsService.markAsRead(req.params.id as string, req.user!.userId);
    res.json({ message: 'Đã đánh dấu đã đọc.' });
  },
};
