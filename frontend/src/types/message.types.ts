/**
 * @fileoverview Định nghĩa các kiểu dữ liệu liên quan đến hệ thống nhắn tin.
 * Bao gồm tin nhắn, cuộc trò chuyện, và payload gửi tin.
 */

import type { User } from './auth.types';

/**
 * Một tin nhắn trong cuộc trò chuyện.
 */
export interface Message {
  /** Mã định danh duy nhất */
  id: string;
  /** ID cuộc trò chuyện chứa tin nhắn này */
  conversationId: string;
  /** ID người gửi */
  senderId: string;
  /** Nội dung tin nhắn */
  content: string;
  /** Thời gian gửi (ISO 8601) */
  createdAt: string;
  /** Đã đọc hay chưa */
  isRead: boolean;
}

/**
 * Cuộc trò chuyện giữa hai người dùng.
 * Thường liên quan đến một tin đăng sản phẩm cụ thể.
 */
export interface Conversation {
  /** Mã định danh duy nhất */
  id: string;
  /** Người tham gia cuộc trò chuyện (2 người) */
  participants: User[];
  /** Tin nhắn cuối cùng (để hiển thị preview) */
  lastMessage: Message | null;
  /** Tin đăng liên quan (nếu có) */
  listingId?: string;
  /** Tiêu đề tin đăng liên quan */
  listingTitle?: string;
  /** Ảnh bìa tin đăng liên quan */
  listingImage?: string;
  /** Số tin nhắn chưa đọc */
  unreadCount: number;
  /** Thời gian cập nhật cuối (ISO 8601) */
  updatedAt: string;
}

/**
 * Payload gửi tin nhắn mới.
 */
export interface SendMessagePayload {
  /** ID cuộc trò chuyện */
  conversationId: string;
  /** Nội dung tin nhắn */
  content: string;
}

/**
 * Payload bắt đầu cuộc trò chuyện mới.
 */
export interface StartConversationPayload {
  /** ID người nhận */
  recipientId: string;
  /** Nội dung tin nhắn đầu tiên */
  content: string;
  /** ID tin đăng liên quan (tuỳ chọn) */
  listingId?: string;
}

/**
 * Trạng thái messaging trong Redux store.
 */
export interface MessageState {
  /** Danh sách cuộc trò chuyện */
  conversations: Conversation[];
  /** Cuộc trò chuyện đang xem */
  activeConversation: Conversation | null;
  /** Tin nhắn của cuộc trò chuyện đang xem */
  messages: Message[];
  /** Tổng số tin nhắn chưa đọc */
  totalUnread: number;
  /** Đang tải danh sách */
  isLoading: boolean;
  /** Đang gửi tin nhắn */
  isSending: boolean;
  /** Lỗi */
  error: string | null;
  /** Còn tin nhắn cũ hơn để tải không */
  hasMoreMessages: boolean;
}
