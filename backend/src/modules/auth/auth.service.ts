/**
 * @fileoverview Auth service — business logic xác thực người dùng.
 */

import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors/AppError.js';
import { formatUser } from '../../shared/utils/formatUser.js';
import type { LoginInput, RegisterInput } from './auth.validation.js';

const SALT_ROUNDS = 12;

export const authService = {
  /**
   * Đăng ký tài khoản mới.
   */
  async register(input: RegisterInput) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) {
      throw new ConflictError('Email này đã được sử dụng.');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        displayName: input.displayName,
      },
    });

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Lưu refresh token vào DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: formatUser(user),
      accessToken,
      refreshToken,
    };
  },

  /**
   * Đăng nhập bằng email và mật khẩu.
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng.');
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng.');
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      user: formatUser(user),
      accessToken,
      refreshToken,
    };
  },

  /**
   * Refresh access token bằng refresh token.
   */
  async refresh(token: string) {
    const payload = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.refreshToken !== token) {
      throw new UnauthorizedError('Phiên đăng nhập đã hết hạn.');
    }

    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      user: formatUser(user),
      accessToken,
      refreshToken: newRefreshToken,
    };
  },

  /**
   * Đăng xuất — xoá refresh token.
   */
  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  },

  /**
   * Lấy thông tin user hiện tại.
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedError('Người dùng không tồn tại.');
    }
    return formatUser(user);
  },
};
