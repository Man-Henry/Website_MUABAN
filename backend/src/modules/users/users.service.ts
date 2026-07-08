/**
 * @fileoverview Users service.
 */

import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { NotFoundError, UnauthorizedError } from '../../shared/errors/AppError.js';
import { uploadToCloudinary } from '../../shared/utils/cloudinary.js';
import { formatUser } from '../../shared/utils/formatUser.js';

export const usersService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('Người dùng không tồn tại.');
    return formatUser(user);
  },

  async getPublicProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('Người dùng không tồn tại.');
    return formatUser(user);
  },

  async updateProfile(userId: string, data: { displayName?: string; phone?: string; bio?: string; location?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return formatUser(user);
  },

  async uploadAvatar(userId: string, fileBuffer: Buffer) {
    const result = await uploadToCloudinary(fileBuffer, 'secondlife/avatars');
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: result.url },
    });
    return { url: user.avatar! };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('Người dùng không tồn tại.');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new UnauthorizedError('Mật khẩu hiện tại không đúng.');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  },

  async getUserListings(userId: string) {
    /** Map Prisma enum → frontend condition string */
    const conditionReverseMap: Record<string, string> = {
      'new_item': 'new',
      'like_new': 'like-new',
      'good': 'good',
      'fair': 'fair',
    };

    const listings = await prisma.listing.findMany({
      where: { sellerId: userId },
      include: {
        images: { select: { id: true, url: true } },
        seller: { select: { id: true, email: true, displayName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return listings.map((listing) => ({
      ...listing,
      condition: conditionReverseMap[listing.condition] || listing.condition,
    }));
  },
};
