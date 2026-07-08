/**
 * @fileoverview Reviews service.
 */

import prisma from '../../config/db.js';

const reviewInclude = {
  reviewer: { select: { id: true, email: true, displayName: true, avatar: true } },
} as const;

export const reviewsService = {
  async getListingReviews(listingId: string) {
    return prisma.review.findMany({
      where: { listingId },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getSellerReviews(sellerId: string) {
    return prisma.review.findMany({
      where: { sellerId },
      include: reviewInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getSellerRating(sellerId: string) {
    const reviews = await prisma.review.findMany({
      where: { sellerId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    for (const r of reviews) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      total += r.rating;
    }

    return {
      totalReviews: reviews.length,
      averageRating: Math.round((total / reviews.length) * 10) / 10,
      distribution,
    };
  },

  async createReview(
    reviewerId: string,
    listingId: string,
    data: { sellerId: string; rating: number; comment: string },
  ) {
    const review = await prisma.review.create({
      data: {
        listingId,
        reviewerId,
        sellerId: data.sellerId,
        rating: data.rating,
        comment: data.comment,
      },
      include: reviewInclude,
    });
    return review;
  },
};
