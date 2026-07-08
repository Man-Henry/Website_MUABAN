/**
 * @fileoverview Conversations service.
 * Tích hợp Socket.IO để phát sự kiện real-time khi gửi tin nhắn.
 */

import prisma from '../../config/db.js';
import { ForbiddenError, NotFoundError } from '../../shared/errors/AppError.js';
import { getIO, sanitizeMessage, isUserOnline } from '../../config/socket.js';

const conversationInclude = {
  participants: {
    include: {
      user: { select: { id: true, email: true, displayName: true, avatar: true } },
    },
  },
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
} as const;

/** Format conversation cho frontend */
const formatConversation = (conv: any, currentUserId: string) => {
  const participants = conv.participants.map((p: any) => ({
    ...p.user,
    isOnline: isUserOnline(p.user.id),
  }));
  const lastMessage = conv.messages[0] || null;

  // Đếm tin chưa đọc
  const myParticipant = conv.participants.find((p: any) => p.userId === currentUserId);
  let unreadCount = 0;
  if (myParticipant && lastMessage) {
    // Count messages after lastReadAt from other participants
    // Simplified: just check if lastMessage is unread
    unreadCount = lastMessage.senderId !== currentUserId &&
      new Date(lastMessage.createdAt) > new Date(myParticipant.lastReadAt) ? 1 : 0;
  }

  return {
    id: conv.id,
    participants,
    lastMessage: lastMessage ? {
      id: lastMessage.id,
      conversationId: lastMessage.conversationId,
      senderId: lastMessage.senderId,
      content: lastMessage.content,
      createdAt: lastMessage.createdAt,
      isRead: !(lastMessage.senderId !== currentUserId &&
        myParticipant && new Date(lastMessage.createdAt) > new Date(myParticipant.lastReadAt)),
    } : null,
    listingId: conv.listingId,
    listingTitle: conv.listingTitle,
    listingImage: conv.listingImage,
    unreadCount,
    updatedAt: conv.updatedAt,
  };
};

export const conversationsService = {
  /**
   * Lấy danh sách cuộc trò chuyện của user.
   */
  async getConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: conversationInclude,
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((c) => formatConversation(c, userId));
  },

  /**
   * Lấy chi tiết cuộc trò chuyện.
   */
  async getConversation(id: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: conversationInclude,
    });
    if (!conversation) throw new NotFoundError('Cuộc trò chuyện không tồn tại.');

    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenError('Bạn không có quyền xem cuộc trò chuyện này.');

    return formatConversation(conversation, userId);
  },

  /**
   * Lấy tin nhắn (cursor pagination).
   */
  async getMessages(conversationId: string, userId: string, before?: string) {
    // Lấy thông tin tất cả participants trong conversation để tính isRead
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
    });
    const myParticipant = participants.find((p) => p.userId === userId);
    
    if (!myParticipant) throw new ForbiddenError('Bạn không có quyền xem tin nhắn này.');

    const where: any = { conversationId };
    if (before) {
      const cursor = await prisma.message.findUnique({ where: { id: before } });
      if (cursor) {
        where.createdAt = { lt: cursor.createdAt };
      }
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return messages.reverse().map((m) => {
      // Để xác định tin nhắn đã đọc chưa:
      // Nếu là tin nhắn CỦA MÌNH gửi -> Xem người khác đã đọc chưa (createdAt <= lastReadAt của họ)
      // Nếu là tin nhắn NGƯỜI KHÁC gửi -> Xem mình đã đọc chưa (createdAt <= lastReadAt của mình)
      let isRead = false;
      if (m.senderId === userId) {
        // Tin nhắn của mình gửi, kiểm tra xem người nhận đã đọc chưa
        const otherParticipant = participants.find((p) => p.userId !== userId);
        if (otherParticipant && new Date(m.createdAt) <= new Date(otherParticipant.lastReadAt)) {
          isRead = true;
        }
      } else {
        // Tin nhắn của người khác gửi, kiểm tra xem mình đã đọc chưa
        if (new Date(m.createdAt) <= new Date(myParticipant.lastReadAt)) {
          isRead = true;
        }
      }

      return {
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt,
        isRead,
      };
    });
  },

  /**
   * Gửi tin nhắn.
   */
  async sendMessage(conversationId: string, userId: string, content: string) {
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });
    if (!participant) throw new ForbiddenError('Bạn không thể gửi tin nhắn vào cuộc trò chuyện này.');

    // Sanitize nội dung chống XSS
    const cleanContent = sanitizeMessage(content);

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: cleanContent,
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const formattedMessage = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      isRead: false,
    };

    // -----------------------------------------------------------------------
    // Real-time: Phát sự kiện tin nhắn mới cho tất cả participants khác
    // -----------------------------------------------------------------------
    try {
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId },
        select: { userId: true },
      });

      const io = getIO();
      for (const p of participants) {
        if (p.userId !== userId) {
          // Gửi vào room = userId của người nhận
          io.to(p.userId).emit('message:received', formattedMessage);
        }
      }
    } catch (error) {
      // Socket emit thất bại không ảnh hưởng đến việc lưu tin nhắn
      console.error('⚠️ Socket emit error (sendMessage):', error);
    }

    return formattedMessage;
  },

  /**
   * Bắt đầu cuộc trò chuyện mới.
   */
  async startConversation(
    userId: string,
    data: { recipientId: string; content: string; listingId?: string },
  ) {
    // Sanitize nội dung chống XSS
    const cleanContent = sanitizeMessage(data.content);

    // Kiểm tra xem đã có cuộc trò chuyện giữa 2 người chưa
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: data.recipientId } } },
          ...(data.listingId ? [{ listingId: data.listingId }] : []),
        ],
      },
      include: conversationInclude,
    });

    if (existing) {
      // Gửi tin nhắn vào conversation hiện tại (sendMessage đã có emit)
      await this.sendMessage(existing.id, userId, cleanContent);
      const updated = await prisma.conversation.findUnique({
        where: { id: existing.id },
        include: conversationInclude,
      });
      return formatConversation(updated!, userId);
    }

    // Lấy thông tin listing nếu có
    let listingTitle: string | null = null;
    let listingImage: string | null = null;
    if (data.listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: data.listingId },
        include: { images: { take: 1 } },
      });
      if (listing) {
        listingTitle = listing.title;
        listingImage = listing.images[0]?.url || null;
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        listingId: data.listingId,
        listingTitle,
        listingImage,
        participants: {
          create: [
            { userId },
            { userId: data.recipientId },
          ],
        },
        messages: {
          create: {
            senderId: userId,
            content: cleanContent,
          },
        },
      },
      include: conversationInclude,
    });

    // -----------------------------------------------------------------------
    // Real-time: Thông báo cuộc trò chuyện mới cho người nhận
    // -----------------------------------------------------------------------
    try {
      const io = getIO();
      const recipientConv = formatConversation(conversation, data.recipientId);
      io.to(data.recipientId).emit('conversation:new', recipientConv);
    } catch (error) {
      console.error('⚠️ Socket emit error (startConversation):', error);
    }

    return formatConversation(conversation, userId);
  },

  /**
   * Đánh dấu đã đọc.
   */
  async markAsRead(conversationId: string, userId: string) {
    await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    });
  },
};
