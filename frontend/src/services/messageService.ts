/**
 * @fileoverview Service xử lý các thao tác liên quan đến nhắn tin.
 * Giao tiếp với API endpoints để quản lý cuộc trò chuyện và tin nhắn.
 */

import type { Conversation, Message, SendMessagePayload, StartConversationPayload } from '../types/message.types';
import api from './api';

/**
 * Lấy danh sách cuộc trò chuyện của người dùng hiện tại.
 * Sắp xếp theo thời gian cập nhật mới nhất.
 */
const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get<Conversation[]>('/conversations');
  return response.data;
};

/**
 * Lấy chi tiết một cuộc trò chuyện theo ID.
 */
const getConversation = async (id: string): Promise<Conversation> => {
  const response = await api.get<Conversation>(`/conversations/${id}`);
  return response.data;
};

/**
 * Lấy danh sách tin nhắn trong một cuộc trò chuyện.
 * Hỗ trợ phân trang (cursor-based).
 *
 * @param conversationId - ID cuộc trò chuyện
 * @param before - Lấy tin nhắn trước ID này (pagination cursor)
 */
const getMessages = async (
  conversationId: string,
  before?: string
): Promise<Message[]> => {
  const params: Record<string, string> = {};
  if (before) params.before = before;

  const response = await api.get<Message[]>(
    `/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};

/**
 * Gửi tin nhắn mới trong cuộc trò chuyện.
 */
const sendMessage = async (payload: SendMessagePayload): Promise<Message> => {
  const response = await api.post<Message>(
    `/conversations/${payload.conversationId}/messages`,
    { content: payload.content }
  );
  return response.data;
};

/**
 * Bắt đầu cuộc trò chuyện mới với người bán.
 * Nếu đã có cuộc trò chuyện, trả về cuộc trò chuyện hiện tại.
 */
const startConversation = async (
  payload: StartConversationPayload
): Promise<Conversation> => {
  const response = await api.post<Conversation>('/conversations', payload);
  return response.data;
};

/**
 * Đánh dấu tất cả tin nhắn trong cuộc trò chuyện đã đọc.
 */
const markAsRead = async (conversationId: string): Promise<void> => {
  await api.patch(`/conversations/${conversationId}/read`);
};

/** Service quản lý nhắn tin */
const messageService = {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  startConversation,
  markAsRead,
} as const;

export default messageService;
