/**
 * @fileoverview Redux slice quản lý trạng thái nhắn tin.
 */

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Conversation, Message, MessageState, SendMessagePayload, StartConversationPayload } from '../../types/message.types';
// ✅ REAL API MODE: sử dụng service gọi API thật
import messageService from '../../services/messageService';

const initialState: MessageState & {
  /** Map conversationId → danh sách userId đang nhập */
  typingUsers: Record<string, string[]>;
  /** Trạng thái kết nối Socket */
  socketConnected: boolean;
} = {
  conversations: [],
  activeConversation: null,
  messages: [],
  totalUnread: 0,
  isLoading: false,
  isSending: false,
  error: null,
  typingUsers: {},
  socketConnected: false,
  hasMoreMessages: true,
};

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

export const fetchConversations = createAsyncThunk(
  'message/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      return await messageService.getConversations();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Không thể tải cuộc trò chuyện.';
      return rejectWithValue(msg);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async (payload: { conversationId: string; before?: string }, { rejectWithValue }) => {
    try {
      const { conversationId, before } = payload;
      const [conversation, messages] = await Promise.all([
        messageService.getConversation(conversationId),
        messageService.getMessages(conversationId, before),
      ]);
      return { conversation, messages, isLoadMore: !!before };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Không thể tải tin nhắn.';
      return rejectWithValue(msg);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async (payload: SendMessagePayload, { rejectWithValue }) => {
    try {
      return await messageService.sendMessage(payload);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gửi tin nhắn thất bại.';
      return rejectWithValue(msg);
    }
  }
);

export const startConversation = createAsyncThunk(
  'message/startConversation',
  async (payload: StartConversationPayload, { rejectWithValue }) => {
    try {
      return await messageService.startConversation(payload);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Không thể bắt đầu cuộc trò chuyện.';
      return rejectWithValue(msg);
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearActiveConversation: (state) => {
      state.activeConversation = null;
      state.messages = [];
    },
    clearMessageError: (state) => {
      state.error = null;
    },
    /** Thêm tin nhắn real-time (từ WebSocket) */
    addIncomingMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      if (state.activeConversation?.id === msg.conversationId) {
        state.messages.push(msg);
      }
      // Cập nhật lastMessage trong conversations list
      const conv = state.conversations.find((c) => c.id === msg.conversationId);
      if (conv) {
        conv.lastMessage = msg;
        conv.updatedAt = msg.createdAt;
        if (state.activeConversation?.id !== msg.conversationId) {
          conv.unreadCount += 1;
          state.totalUnread += 1;
        }
      }
    },
    /** Cập nhật trạng thái đang nhập (từ Socket.IO typing event) */
    updateTypingStatus: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>
    ) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      const typingList = state.typingUsers[conversationId];
      if (isTyping && !typingList.includes(userId)) {
        typingList.push(userId);
      } else if (!isTyping) {
        state.typingUsers[conversationId] = typingList.filter((id) => id !== userId);
      }
    },
    /** Cập nhật trạng thái kết nối Socket */
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    /** Thêm cuộc trò chuyện mới (từ Socket.IO conversation:new event) */
    addNewConversation: (state, action: PayloadAction<Conversation>) => {
      const exists = state.conversations.find((c) => c.id === action.payload.id);
      if (!exists) {
        state.conversations.unshift(action.payload);
        state.totalUnread += action.payload.unreadCount;
      }
    },
    /** Cập nhật trạng thái trực tuyến của user (từ Socket.IO user:status_changed) */
    updateUserStatus: (state, action: PayloadAction<{ userId: string; status: 'online' | 'offline' }>) => {
      const { userId, status } = action.payload;
      const isOnline = status === 'online';
      
      state.conversations.forEach((conv) => {
        const participant = conv.participants.find((p) => p.id === userId);
        if (participant) {
          participant.isOnline = isOnline;
        }
      });
      if (state.activeConversation) {
        const activeParticipant = state.activeConversation.participants.find((p) => p.id === userId);
        if (activeParticipant) {
          activeParticipant.isOnline = isOnline;
        }
      }
    },
    /** Đánh dấu cuộc trò chuyện đã đọc trên thiết bị này (đồng bộ multi-device) */
    markConversationAsReadLocally: (state, action: PayloadAction<{ conversationId: string }>) => {
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conv && conv.unreadCount > 0) {
        state.totalUnread -= conv.unreadCount;
        conv.unreadCount = 0;
      }
      
      // Nếu đang mở đúng cuộc trò chuyện này, đánh dấu các tin nhắn của người khác là đã đọc
      if (state.activeConversation?.id === action.payload.conversationId) {
        state.messages.forEach((msg) => {
          // Tin nhắn của người khác chưa đọc -> thành đã đọc
          // (việc kiểm tra senderId sẽ cần id của mình, ta có thể đánh dấu tất cả isRead = true 
          // vì mình đã đọc cuộc trò chuyện này)
          msg.isRead = true;
        });
      }
    },
    /** Đánh dấu các tin nhắn mình đã gửi là đã được đối phương xem */
    markMessagesAsSeen: (state, action: PayloadAction<{ conversationId: string; seenBy: string }>) => {
      if (state.activeConversation?.id === action.payload.conversationId) {
        // Cập nhật trạng thái các tin nhắn mình gửi trong messages array
        state.messages.forEach((msg) => {
          if (msg.senderId !== action.payload.seenBy) {
            msg.isRead = true;
          }
        });
      }
      // Cập nhật preview lastMessage trong list nếu mình là người gửi
      const conv = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conv && conv.lastMessage && conv.lastMessage.senderId !== action.payload.seenBy) {
        conv.lastMessage.isRead = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
        state.totalUnread = action.payload.reduce((sum, c) => sum + c.unreadCount, 0);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeConversation = action.payload.conversation;
        
        if (action.payload.isLoadMore) {
          // Prepend messages to the existing array
          state.messages = [...action.payload.messages, ...state.messages];
        } else {
          // Replace completely
          state.messages = action.payload.messages;
        }
        
        // Nếu API trả về ít hơn 50 tin nhắn (đây là take limit) thì hết dữ liệu
        state.hasMoreMessages = action.payload.messages.length === 50;

        // Mark as read locally
        const conv = state.conversations.find((c) => c.id === action.payload.conversation.id);
        if (conv) {
          state.totalUnread -= conv.unreadCount;
          conv.unreadCount = 0;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push(action.payload);
        // Update conversation preview
        const conv = state.conversations.find((c) => c.id === action.payload.conversationId);
        if (conv) {
          conv.lastMessage = action.payload;
          conv.updatedAt = action.payload.createdAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      })

      .addCase(startConversation.fulfilled, (state, action) => {
        const exists = state.conversations.find((c) => c.id === action.payload.id);
        if (!exists) {
          state.conversations.unshift(action.payload);
        }
        state.activeConversation = action.payload;
      });
  },
});

export const {
  clearActiveConversation,
  clearMessageError,
  addIncomingMessage,
  updateTypingStatus,
  setSocketConnected,
  addNewConversation,
  updateUserStatus,
  markConversationAsReadLocally,
  markMessagesAsSeen,
} = messageSlice.actions;
export default messageSlice.reducer;
