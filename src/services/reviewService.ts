/**
 * @fileoverview Service xử lý các thao tác liên quan đến đánh giá và rating.
 */

import type { Review, SellerRating, CreateReviewPayload } from '../types/review.types';
import api from './api';

/**
 * Lấy danh sách đánh giá của một tin đăng.
 */
const getListingReviews = async (listingId: string): Promise<Review[]> => {
  const response = await api.get<Review[]>(`/listings/${listingId}/reviews`);
  return response.data;
};

/**
 * Lấy danh sách đánh giá của một người bán.
 */
const getSellerReviews = async (sellerId: string): Promise<Review[]> => {
  const response = await api.get<Review[]>(`/users/${sellerId}/reviews`);
  return response.data;
};

/**
 * Lấy tổng hợp rating của người bán.
 */
const getSellerRating = async (sellerId: string): Promise<SellerRating> => {
  const response = await api.get<SellerRating>(`/users/${sellerId}/rating`);
  return response.data;
};

/**
 * Tạo đánh giá mới.
 */
const createReview = async (payload: CreateReviewPayload): Promise<Review> => {
  const response = await api.post<Review>(`/listings/${payload.listingId}/reviews`, payload);
  return response.data;
};

/** Service quản lý đánh giá */
const reviewService = {
  getListingReviews,
  getSellerReviews,
  getSellerRating,
  createReview,
} as const;

export default reviewService;
