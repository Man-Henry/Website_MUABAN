/**
 * @fileoverview Entry point — kết nối DB, khởi chạy server + Socket.IO, graceful shutdown.
 */

import { createServer } from 'http';
import app from './app.js';
import prisma from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './config/socket.js';

const startServer = async () => {
  try {
    // Kiểm tra kết nối database
    await prisma.$connect();
    console.log('✅ Đã kết nối PostgreSQL');

    // Tạo HTTP server từ Express app (cần thiết để Socket.IO chia sẻ cổng)
    const httpServer = createServer(app);

    // Khởi tạo Socket.IO trên HTTP server
    await initSocket(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${env.PORT}`);
      console.log(`📖 Health check: http://localhost:${env.PORT}/api/health`);
      console.log(`💬 Socket.IO: ws://localhost:${env.PORT}`);
      console.log(`🌱 Môi trường: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n⚠️ Nhận tín hiệu ${signal}. Đang tắt server...`);
      httpServer.close(async () => {
        await prisma.$disconnect();
        console.log('✅ Đã ngắt kết nối database. Server đã tắt.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
