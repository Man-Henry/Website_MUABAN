import React from 'react';
import type { Conversation } from '../../types/message.types';
import { formatRelative } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
}) => {
  const { user } = useAuth();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline/30 mb-3">
          forum
        </span>
        <p className="text-body-sm text-on-surface-variant">Chưa có cuộc trò chuyện nào</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-outline-variant/15">
      {conversations.map((conv) => {
        const isActive = conv.id === activeId;
        const otherUser = conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];

        return (
          <button
            key={conv.id}
            type="button"
            onClick={() => onSelect(conv)}
            className={`
              w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 cursor-pointer
              ${isActive ? 'bg-primary-container/10' : 'hover:bg-surface-container'}
            `}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container text-label-md font-bold">
                {otherUser?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {conv.unreadCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-bold min-w-[18px]">
                  {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-body-sm truncate ${conv.unreadCount > 0 ? 'text-on-surface font-semibold' : 'text-on-surface font-medium'}`}>
                  {otherUser?.displayName || 'Người dùng'}
                </p>
                <span className="text-label-sm text-outline shrink-0">
                  {conv.lastMessage ? formatRelative(conv.lastMessage.createdAt) : ''}
                </span>
              </div>

              {/* Listing context */}
              {conv.listingTitle && (
                <p className="text-label-sm text-primary truncate mt-0.5">
                  {conv.listingTitle}
                </p>
              )}

              {/* Last message preview */}
              <p className={`text-label-sm truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-on-surface-variant font-medium' : 'text-outline'}`}>
                {conv.lastMessage?.content || 'Bắt đầu trò chuyện...'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
