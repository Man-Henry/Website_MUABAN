/**
 * @fileoverview Socket.IO Client Service cho real-time chat.
 *
 * Quản lý toàn bộ vòng đời kết nối Socket.IO:
 * - Kết nối khi user đăng nhập thành công
 * - Ngắt kết nối khi user đăng xuất
 * - Lắng nghe sự kiện: message:received, conversation:new, typing, presence
 * - Tự động reconnect khi mất mạng
 * - Tự động refresh token khi hết hạn
 *
 * Kiến trúc: Socket chỉ đóng vai trò signaling (nhận thông báo dữ liệu mới).
 * Tải lịch sử chat, tìm kiếm tin nhắn luôn qua REST API.
 */

import { io, type Socket } from 'socket.io-client';
import { store } from '../redux/store';
import {
  addIncomingMessage,
  updateTypingStatus,
  setSocketConnected,
  addNewConversation,
  updateUserStatus,
  markConversationAsReadLocally,
  markMessagesAsSeen,
  fetchConversations,
  fetchMessages,
} from '../redux/slices/messageSlice';
import { checkSession } from '../redux/slices/authSlice';
import { getAccessToken } from './api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Trạng thái kết nối Socket */
export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

/** Typing update event */
export interface TypingUpdate {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

/** User status change event */
export interface UserStatusChange {
  userId: string;
  status: 'online' | 'offline';
}

// ---------------------------------------------------------------------------
// Socket Instance & State
// ---------------------------------------------------------------------------

let socket: Socket | null = null;
let currentStatus: SocketStatus = 'disconnected';

/** Event listeners được đăng ký từ bên ngoài (VD: React components) */
const eventListeners = new Map<string, Set<(...args: unknown[]) => void>>();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Lấy trạng thái kết nối hiện tại của Socket.
 */
export const getSocketStatus = (): SocketStatus => currentStatus;

/**
 * Kiểm tra socket có đang kết nối không.
 */
export const isSocketConnected = (): boolean =>
  socket !== null && socket.connected;

/**
 * Kết nối Socket.IO tới server.
 * Gọi sau khi đăng nhập/checkSession thành công.
 *
 * @param token - JWT access token để xác thực kết nối
 */
export const connectSocket = (token?: string): void => {
  // Nếu đã kết nối rồi, không kết nối lại
  if (socket?.connected) {
    return;
  }

  // Ngắt kết nối cũ nếu có
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  const accessToken = token || getAccessToken();
  if (!accessToken) {
    console.warn('⚠️ Không có access token, bỏ qua kết nối Socket.');
    return;
  }

  currentStatus = 'connecting';
  notifyStatusListeners();

  // Khởi tạo kết nối
  // Trong dev mode, Vite proxy sẽ forward /socket.io tới backend
  // Trong production, cần URL tường minh tới backend server
  const socketUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : undefined;

  socket = io(socketUrl, {
    auth: {
      token: accessToken,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    // Không auto connect, để kiểm soát timing
    autoConnect: true,
  });

  // -------------------------------------------------------------------------
  // Connection Events
  // -------------------------------------------------------------------------

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
    currentStatus = 'connected';
    store.dispatch(setSocketConnected(true));
    notifyStatusListeners();
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
    currentStatus = reason === 'io server disconnect' ? 'disconnected' : 'reconnecting';
    store.dispatch(setSocketConnected(false));
    notifyStatusListeners();
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Socket connection error:', error.message);

    // Nếu lỗi xác thực, thử refresh token
    if (error.message.includes('AUTH_ERROR')) {
      currentStatus = 'disconnected';
      store.dispatch(setSocketConnected(false));
      notifyStatusListeners();
      
      // Emit cho components biết cần refresh token (tuỳ chọn)
      notifyEventListeners('auth:token_expired', []);
      
      // Tự động dispatch checkSession để làm mới phiên làm việc
      store.dispatch(checkSession()).then((result) => {
        if (checkSession.fulfilled.match(result)) {
          // Kết nối lại nếu refresh token thành công
          connectSocket();
        }
      });
    } else {
      currentStatus = 'reconnecting';
      notifyStatusListeners();
    }
  });

  // Socket.IO v4 emits 'reconnect' trên manager, không trên socket
  socket.io.on('reconnect', (attemptNumber: number) => {
    console.log(`🔌 Socket reconnected (attempt ${attemptNumber})`);
    currentStatus = 'connected';
    store.dispatch(setSocketConnected(true));
    notifyStatusListeners();
    
    // Offline sync: Tự động tải lại dữ liệu bị nhỡ trong thời gian mất mạng
    store.dispatch(fetchConversations());
    const state = store.getState();
    const activeConvId = state.message.activeConversation?.id;
    if (activeConvId) {
      store.dispatch(fetchMessages({ conversationId: activeConvId }));
    }
    
    // Thông báo reconnect để components có thể sync dữ liệu nhỡ (tuỳ chọn)
    notifyEventListeners('reconnected', []);
  });

  socket.io.on('reconnect_attempt', (attemptNumber: number) => {
    console.log(`🔌 Socket reconnect attempt ${attemptNumber}`);
    currentStatus = 'reconnecting';
    notifyStatusListeners();
  });

  // -------------------------------------------------------------------------
  // Chat Events
  // -------------------------------------------------------------------------

  /** Nhận tin nhắn mới từ người khác */
  socket.on('message:received', (message: unknown) => {
    // Dispatch vào Redux store
    store.dispatch(addIncomingMessage(message as Parameters<typeof addIncomingMessage>[0]));
    // Thông báo cho listeners bên ngoài
    notifyEventListeners('message:received', [message]);
  });

  /** Nhận cuộc trò chuyện mới */
  socket.on('conversation:new', (conversation: unknown) => {
    store.dispatch(addNewConversation(conversation as Parameters<typeof addNewConversation>[0]));
    notifyEventListeners('conversation:new', [conversation]);
  });

  /** Typing indicator */
  socket.on('typing:update', (data: TypingUpdate) => {
    store.dispatch(updateTypingStatus(data));
    notifyEventListeners('typing:update', [data]);
  });

  /** Conversation đã được đọc (multi-device sync) */
  socket.on('conversation:read', (data: { conversationId: string; userId: string }) => {
    store.dispatch(markConversationAsReadLocally(data));
    notifyEventListeners('conversation:read', [data]);
  });

  /** Tin nhắn đã được xem bởi đối phương */
  socket.on('message:seen', (data: { conversationId: string; seenBy: string }) => {
    store.dispatch(markMessagesAsSeen(data));
    notifyEventListeners('message:seen', [data]);
  });

  /** User online/offline status */
  socket.on('user:status_changed', (data: UserStatusChange) => {
    store.dispatch(updateUserStatus(data));
    notifyEventListeners('user:status_changed', [data]);
  });
};

/**
 * Ngắt kết nối Socket.IO.
 * Gọi khi user đăng xuất.
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  currentStatus = 'disconnected';
  notifyStatusListeners();
  // Xóa tất cả external event listeners
  eventListeners.clear();
};

// ---------------------------------------------------------------------------
// Emit Events (gửi sự kiện lên server)
// ---------------------------------------------------------------------------

/**
 * Gửi sự kiện "đang nhập" cho cuộc trò chuyện.
 */
export const emitTypingStart = (conversationId: string): void => {
  socket?.emit('typing:start', { conversationId });
};

/**
 * Gửi sự kiện "ngừng nhập" cho cuộc trò chuyện.
 */
export const emitTypingStop = (conversationId: string): void => {
  socket?.emit('typing:stop', { conversationId });
};

/**
 * Gửi sự kiện "đã xem tin nhắn" cho cuộc trò chuyện.
 */
export const emitMessageRead = (conversationId: string): void => {
  socket?.emit('message:read', { conversationId });
};

// ---------------------------------------------------------------------------
// External Event Listener System
// ---------------------------------------------------------------------------

/**
 * Đăng ký lắng nghe sự kiện Socket từ bên ngoài (VD: React components).
 * @returns Hàm unsubscribe
 */
export const onSocketEvent = (
  event: string,
  callback: (...args: unknown[]) => void
): (() => void) => {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event)!.add(callback);

  // Return unsubscribe function
  return () => {
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        eventListeners.delete(event);
      }
    }
  };
};

/** Thông báo tất cả listeners đã đăng ký cho 1 event */
const notifyEventListeners = (event: string, args: unknown[]): void => {
  const listeners = eventListeners.get(event);
  if (listeners) {
    for (const cb of listeners) {
      try {
        cb(...args);
      } catch (err) {
        console.error(`Socket event listener error (${event}):`, err);
      }
    }
  }
};

// ---------------------------------------------------------------------------
// Status Listener System
// ---------------------------------------------------------------------------

/** Listeners theo dõi thay đổi trạng thái kết nối */
const statusListeners = new Set<(status: SocketStatus) => void>();

/**
 * Đăng ký theo dõi thay đổi trạng thái kết nối Socket.
 * @returns Hàm unsubscribe
 */
export const onSocketStatusChange = (
  callback: (status: SocketStatus) => void
): (() => void) => {
  statusListeners.add(callback);
  // Gọi ngay với trạng thái hiện tại
  callback(currentStatus);
  return () => {
    statusListeners.delete(callback);
  };
};

/** Thông báo thay đổi status cho tất cả listeners */
const notifyStatusListeners = (): void => {
  for (const cb of statusListeners) {
    try {
      cb(currentStatus);
    } catch (err) {
      console.error('Socket status listener error:', err);
    }
  }
};
