import React, { useState, useRef, useEffect } from 'react';
import type { Message, Conversation } from '../../types/message.types';
import { useAuth } from '../../hooks/useAuth';
import { formatRelative } from '../../utils/formatDate';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  isSending: boolean;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  isSending,
  onSendMessage,
  onBack,
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const otherUser = conversation.participants.find((p) => p.id !== user?.id) || conversation.participants[0];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || isSending) return;
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container text-label-md font-bold">
          {otherUser?.displayName?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-body-md text-on-surface font-medium truncate">
            {otherUser?.displayName || 'Người dùng'}
          </p>
          {conversation.listingTitle && (
            <p className="text-label-sm text-primary truncate">
              {conversation.listingTitle}
            </p>
          )}
        </div>
      </div>

      {/* ===== Messages Area ===== */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3 hide-scrollbar">
        {messages.length === 0 ? (
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
                  <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-on-primary/60' : 'text-outline'}`}>
                    {formatRelative(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            disabled={isSending}
            className="flex-1 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2.5 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary disabled:opacity-50 transition-all duration-200"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isSending}
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
