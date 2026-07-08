import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Message, Conversation } from '../../types/message.types';
import { useAuth } from '../../hooks/useAuth';
import { formatRelative } from '../../utils/formatDate';
import { useAppSelector } from '../../redux/store';
import {
  emitTypingStart,
  emitTypingStop,
  onSocketStatusChange,
  emitMessageRead,
  type SocketStatus,
} from '../../services/socketService';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  isSending: boolean;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  isSending,
  onSendMessage,
  onBack,
  hasMoreMessages,
  onLoadMore,
  isLoadingMore,
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('disconnected');

  // Lấy typing state từ Redux
  const typingUsers = useAppSelector(
    (state) => state.message.typingUsers[conversation.id] || []
  );

  const otherUser = conversation.participants.find((p) => p.id !== user?.id) || conversation.participants[0];

  // Theo dõi trạng thái kết nối Socket
  useEffect(() => {
    const unsubscribe = onSocketStatusChange((status) => {
      setSocketStatus(status);
    });
    return unsubscribe;
  }, []);

  // Auto-scroll to bottom & Emit Read Receipt
  useEffect(() => {
    // Preserve scroll position when loading more messages
    if (listRef.current && prevScrollHeight.current > 0) {
      listRef.current.scrollTop = listRef.current.scrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = 0; // reset
    } else {
      // Scroll to bottom for new messages or initial load
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Đánh dấu đã đọc nếu có tin nhắn mới từ người khác
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderId !== user?.id && !lastMsg.isRead) {
        emitMessageRead(conversation.id);
      }
    }
  }, [messages, conversation.id, user?.id]);

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    if (listRef.current.scrollTop === 0 && hasMoreMessages && !isLoadingMore && onLoadMore) {
      prevScrollHeight.current = listRef.current.scrollHeight;
      onLoadMore();
    }
  }, [hasMoreMessages, isLoadingMore, onLoadMore]);

  // ------- Typing Indicator Logic -------
  const handleTypingStart = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      emitTypingStart(conversation.id);
    }

    // Reset timeout mỗi lần gõ phím
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Sau 3 giây không gõ → gửi typing:stop
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTypingStop(conversation.id);
    }, 3000);
  }, [isTyping, conversation.id]);

  // Cleanup typing timeout khi component unmount hoặc conversation thay đổi
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        emitTypingStop(conversation.id);
      }
    };
  }, [conversation.id, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (e.target.value.trim()) {
      handleTypingStart();
    }
  };

  const handleSend = () => {
    const content = input.trim();
    if (!content || isSending) return;

    // Dừng typing khi gửi
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      setIsTyping(false);
      emitTypingStop(conversation.id);
    }

    onSendMessage(content);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Tên người đang nhập (để hiển thị typing indicator)
  const typingDisplayNames = typingUsers
    .filter((id) => id !== user?.id)
    .map((id) => {
      const p = conversation.participants.find((u) => u.id === id);
      return p?.displayName || 'Ai đó';
    });

  const isReconnecting = socketStatus === 'reconnecting' || socketStatus === 'connecting';

  return (
    <div className="flex flex-col h-full">
      {/* ===== Chat Header ===== */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3.5 border-b border-outline-variant/20 bg-surface-container-lowest shrink-0">
        {/* Back button (mobile) */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        )}

        {/* Avatar */}
        <div className="relative">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container text-label-md font-bold">
            {otherUser?.displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {otherUser?.isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-container-lowest bg-green-500"></span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-body-md text-on-surface font-medium truncate flex items-center gap-2">
            {otherUser?.displayName || 'Người dùng'}
          </p>
          {otherUser?.isOnline ? (
            <p className="text-label-sm text-green-600 font-medium truncate">Đang hoạt động</p>
          ) : (
            conversation.listingTitle && (
              <p className="text-label-sm text-primary truncate">
                {conversation.listingTitle}
              </p>
            )
          )}
        </div>
      </div>

      {/* ===== Messages Area ===== */}
      <div 
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3 hide-scrollbar"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <span className="material-symbols-outlined text-[20px] animate-spin text-outline">sync</span>
          </div>
        )}
        
        {messages.length === 0 && !isLoadingMore ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="material-symbols-outlined text-[48px] text-outline/20 mb-2">
              chat_bubble
            </span>
            <p className="text-body-sm text-on-surface-variant">
              Bắt đầu cuộc trò chuyện
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[75%] rounded-2xl px-4 py-2.5 text-body-sm leading-relaxed
                    ${
                      isMine
                        ? 'bg-primary text-on-primary rounded-br-md'
                        : 'bg-surface-container text-on-surface rounded-bl-md'
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isMine ? 'text-on-primary/70' : 'text-outline'}`}>
                    <span>{formatRelative(msg.createdAt)}</span>
                    {isMine && (
                      <span className="material-symbols-outlined text-[14px]">
                        {msg.isRead ? 'done_all' : 'check'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* ===== Typing Indicator ===== */}
        {typingDisplayNames.length > 0 && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-surface-container px-4 py-2.5">
              <div className="flex gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-on-surface-variant/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-on-surface-variant/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-on-surface-variant/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-label-sm text-on-surface-variant">
                {typingDisplayNames.join(', ')} đang nhập...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== Input Area ===== */}
      <div className="px-4 md:px-6 py-3 border-t border-outline-variant/20 bg-surface-container-lowest shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isReconnecting ? 'Đang kết nối lại...' : 'Nhập tin nhắn...'}
            disabled={isSending || isReconnecting}
            className="flex-1 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2.5 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary disabled:opacity-50 transition-all duration-200"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isSending || isReconnecting}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all duration-200 cursor-pointer"
            aria-label="Gửi"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSending ? 'hourglass_top' : 'send'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
