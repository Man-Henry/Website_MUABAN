import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  clearActiveConversation,
} from '../redux/slices/messageSlice';
import type { Conversation } from '../types/message.types';
import ConversationList from '../features/messaging/ConversationList';
import ChatWindow from '../features/messaging/ChatWindow';
import EmptyState from '../components/EmptyState';

const Messages: React.FC = () => {
  const dispatch = useAppDispatch();
  const { conversations, activeConversation, messages, isLoading, isSending } =
    useAppSelector((state) => state.message);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
    return () => {
      dispatch(clearActiveConversation());
    };
  }, [dispatch]);

  const handleSelectConversation = (conv: Conversation) => {
    dispatch(fetchMessages(conv.id));
    setMobileShowChat(true);
  };

  const handleSendMessage = (content: string) => {
    if (!activeConversation) return;
    dispatch(sendMessage({ conversationId: activeConversation.id, content }));
  };

  const handleMobileBack = () => {
    dispatch(clearActiveConversation());
    setMobileShowChat(false);
  };

  return (
    <div className="page-enter">
      <div className="mx-auto max-w-6xl px-0 md:px-6 lg:px-8 py-0 md:py-8">
        {/* Page header (desktop only) */}
        <div className="hidden md:block mb-6 px-4 md:px-0">
          <h1 className="text-headline-md text-on-surface">Tin nhắn</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {conversations.length > 0
              ? `${conversations.length} cuộc trò chuyện`
              : 'Quản lý tin nhắn của bạn'}
          </p>
        </div>

        {/* Chat layout */}
        <div className="md:rounded-2xl md:border md:border-outline-variant/20 md:shadow-sm overflow-hidden bg-surface-container-lowest">
          <div className="flex h-[calc(100vh-64px)] md:h-[600px]">
            {/* ===== Left: Conversation list ===== */}
            <div
              className={`
                w-full md:w-80 lg:w-96 shrink-0 border-r border-outline-variant/20 flex flex-col
                ${mobileShowChat ? 'hidden md:flex' : 'flex'}
              `}
            >
              {/* List header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-outline-variant/20">
                <h2 className="text-label-md text-on-surface font-semibold">
                  Trò chuyện
                </h2>
                <span className="text-label-sm text-on-surface-variant">
                  {conversations.length}
                </span>
              </div>

              {/* List content */}
              <div className="flex-1 overflow-y-auto hide-scrollbar">
                {isLoading && conversations.length === 0 ? (
                  <div className="space-y-0 divide-y divide-outline-variant/15">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                        <div className="h-11 w-11 skeleton rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-3/4 skeleton rounded" />
                          <div className="h-3 w-1/2 skeleton rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ConversationList
                    conversations={conversations}
                    activeId={activeConversation?.id}
                    onSelect={handleSelectConversation}
                  />
                )}
              </div>
            </div>

            {/* ===== Right: Chat window ===== */}
            <div
              className={`
                flex-1 flex flex-col
                ${mobileShowChat ? 'flex' : 'hidden md:flex'}
              `}
            >
              {activeConversation ? (
                <ChatWindow
                  conversation={activeConversation}
                  messages={messages}
                  isSending={isSending}
                  onSendMessage={handleSendMessage}
                  onBack={handleMobileBack}
                />
              ) : (
                <EmptyState
                  icon="forum"
                  title="Chọn cuộc trò chuyện"
                  description="Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
