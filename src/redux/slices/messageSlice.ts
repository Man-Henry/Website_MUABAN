/**
 * @fileoverview Redux slice quản lý trạng thái nhắn tin.
 */

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Conversation, Message, MessageState, SendMessagePayload, StartConversationPayload } from '../../types/message.types';
import messageService from '../../services/messageService';

const initialState: MessageState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  totalUnread: 0,
  isLoading: false,
  isSending: false,
  error: null,
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
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const [conversation, messages] = await Promise.all([
        messageService.getConversation(conversationId),
        messageService.getMessages(conversationId),
      ]);
      return { conversation, messages };
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
        state.messages = action.payload.messages;
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

export const { clearActiveConversation, clearMessageError, addIncomingMessage } = messageSlice.actions;
export default messageSlice.reducer;
