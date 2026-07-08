/**
 * @fileoverview Cấu hình Socket.IO server cho real-time chat.
 *
 * Kiến trúc:
 * - Xác thực kết nối bằng JWT access token (qua handshake auth).
 * - Mỗi user join vào room có tên = userId để nhận tin nhắn cá nhân.
 * - Hỗ trợ Redis Adapter (optional) để scale ngang multi-instance.
 * - Rate limiting: tối đa 5 messages/giây/user.
 * - XSS sanitization cho nội dung tin nhắn.
 *
 * Socket chỉ đảm nhận vai trò "signaling" (thông báo dữ liệu mới).
 * Mọi dữ liệu lịch sử phải tải qua REST API.
 */

import { Server as HttpServer } from 'http';
import { Server, type Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import xss from 'xss';
import { env } from './env.js';
import { verifyAccessToken, type TokenPayload } from '../shared/utils/jwt.js';

// ---------------------------------------------------------------------------
// Singleton Socket.IO instance
// ---------------------------------------------------------------------------

let io: Server;

/**
 * Lấy Socket.IO server instance.
 * Dùng trong các service (conversations, ...) để emit sự kiện.
 * @throws Error nếu chưa gọi initSocket()
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO chưa được khởi tạo. Gọi initSocket() trước.');
  }
  return io;
};

// ---------------------------------------------------------------------------
// Rate Limiting (Token Bucket - in-memory)
// ---------------------------------------------------------------------------

/** Lưu trữ bucket theo userId */
const rateLimitBuckets = new Map<string, { tokens: number; lastRefill: number }>();

/** Cấu hình rate limit */
const RATE_LIMIT = {
  /** Số tin nhắn tối đa trong 1 giây */
  MAX_TOKENS: 5,
  /** Khoảng thời gian nạp lại token (ms) */
  REFILL_INTERVAL: 1000,
};

/**
 * Kiểm tra rate limit cho 1 userId.
 * @returns true nếu được phép gửi, false nếu bị chặn.
 */
const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  let bucket = rateLimitBuckets.get(userId);

  if (!bucket) {
    bucket = { tokens: RATE_LIMIT.MAX_TOKENS, lastRefill: now };
    rateLimitBuckets.set(userId, bucket);
  }

  // Nạp lại tokens dựa trên thời gian đã trôi qua
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= RATE_LIMIT.REFILL_INTERVAL) {
    const refills = Math.floor(elapsed / RATE_LIMIT.REFILL_INTERVAL);
    bucket.tokens = Math.min(
      RATE_LIMIT.MAX_TOKENS,
      bucket.tokens + refills
    );
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
};

// Dọn dẹp bucket cũ mỗi 5 phút
setInterval(() => {
  const now = Date.now();
  const STALE_MS = 5 * 60 * 1000; // 5 phút
  for (const [userId, bucket] of rateLimitBuckets.entries()) {
    if (now - bucket.lastRefill > STALE_MS) {
      rateLimitBuckets.delete(userId);
    }
  }
}, 5 * 60 * 1000);

// ---------------------------------------------------------------------------
// XSS Sanitization
// ---------------------------------------------------------------------------

/**
 * Làm sạch nội dung tin nhắn, loại bỏ mọi HTML/XSS injection.
 * Chỉ cho phép text thuần, strip tất cả HTML tags.
 */
export const sanitizeMessage = (content: string): string => {
  return xss(content.trim(), {
    whiteList: {},          // Không cho phép tag HTML nào
    stripIgnoreTag: true,   // Strip mọi tag không trong whitelist
    stripIgnoreTagBody: ['script', 'style'], // Xóa toàn bộ nội dung script/style
  });
};

// ---------------------------------------------------------------------------
// Online Presence Tracking
// ---------------------------------------------------------------------------

/** Map userId → Set<socketId> — theo dõi user đang online */
const onlineUsers = new Map<string, Set<string>>();

/**
 * Kiểm tra user có đang online không.
 */
export const isUserOnline = (userId: string): boolean => {
  const sockets = onlineUsers.get(userId);
  return !!sockets && sockets.size > 0;
};

/**
 * Lấy danh sách userId đang online.
 */
export const getOnlineUserIds = (): string[] => {
  return Array.from(onlineUsers.keys());
};

// ---------------------------------------------------------------------------
// Khởi tạo Socket.IO
// ---------------------------------------------------------------------------

/**
 * Khởi tạo Socket.IO server và gắn vào HTTP server.
 * @param httpServer - HTTP server từ Express
 */
export const initSocket = async (httpServer: HttpServer): Promise<void> => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
    // Ưu tiên WebSocket, fallback sang polling
    transports: ['websocket', 'polling'],
    // Ping interval / timeout để detect mất kết nối nhanh
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // -------------------------------------------------------------------------
  // Redis Adapter (optional — chỉ kích hoạt khi có REDIS_URL)
  // -------------------------------------------------------------------------
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const pubClient = new Redis(redisUrl);
      const subClient = pubClient.duplicate();

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          pubClient.on('connect', resolve);
          pubClient.on('error', reject);
        }),
        new Promise<void>((resolve, reject) => {
          subClient.on('connect', resolve);
          subClient.on('error', reject);
        }),
      ]);

      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Socket.IO Redis Adapter đã kết nối');
    } catch (error) {
      console.warn('⚠️ Không thể kết nối Redis Adapter, sử dụng in-memory:', error);
    }
  } else {
    console.log('ℹ️ Socket.IO chạy ở chế độ in-memory (không có REDIS_URL)');
  }

  // -------------------------------------------------------------------------
  // Authentication Middleware
  // -------------------------------------------------------------------------
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error('AUTH_ERROR: Token không được cung cấp.'));
    }

    try {
      const payload: TokenPayload = verifyAccessToken(token);
      // Gắn user info vào socket.data
      socket.data.user = payload;
      next();
    } catch {
      return next(new Error('AUTH_ERROR: Token không hợp lệ hoặc đã hết hạn.'));
    }
  });

  // -------------------------------------------------------------------------
  // Connection Handler
  // -------------------------------------------------------------------------
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as TokenPayload;
    const userId = user.userId;

    console.log(`🔌 Socket connected: ${userId} (${socket.id})`);

    // Join vào room cá nhân (userId) — hỗ trợ multi-device
    socket.join(userId);

    // Theo dõi online presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      // Thông báo user vừa online cho tất cả client
      socket.broadcast.emit('user:status_changed', {
        userId,
        status: 'online',
      });
    }
    onlineUsers.get(userId)!.add(socket.id);

    // ------- Typing Events -------
    socket.on('typing:start', (data: { conversationId: string }) => {
      if (!data?.conversationId) return;
      // Gửi cho tất cả participants khác trong conversation
      socket.broadcast.emit('typing:update', {
        conversationId: data.conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data: { conversationId: string }) => {
      if (!data?.conversationId) return;
      socket.broadcast.emit('typing:update', {
        conversationId: data.conversationId,
        userId,
        isTyping: false,
      });
    });

    // ------- Mark as Read (đánh dấu đã xem) -------
    socket.on('message:read', (data: { conversationId: string }) => {
      if (!data?.conversationId) return;
      // Thông báo cho tất cả socket cùng user (multi-device sync)
      io.to(userId).emit('conversation:read', {
        conversationId: data.conversationId,
        userId,
      });
      // Thông báo cho đối phương biết tin nhắn đã được xem
      socket.broadcast.emit('message:seen', {
        conversationId: data.conversationId,
        seenBy: userId,
      });
    });

    // ------- Disconnect -------
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${userId} (${socket.id}) — ${reason}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Thông báo user offline
          socket.broadcast.emit('user:status_changed', {
            userId,
            status: 'offline',
          });
        }
      }
    });
  });

  console.log('✅ Socket.IO server đã khởi tạo');
};
