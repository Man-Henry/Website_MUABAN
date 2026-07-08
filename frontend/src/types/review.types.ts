/**
 * @fileoverview Định nghĩa các kiểu dữ liệu liên quan đến đánh giá sản phẩm/người bán.
 * Bao gồm review, rating, và payload tạo đánh giá.
 */

import type { User } from './auth.types';

/**
 * Một đánh giá từ người mua.
 */
export interface Review {
  /** Mã định danh duy nhất */
  id: string;
  /** ID tin đăng được đánh giá */
  listingId: string;
  /** Người đánh giá */
  reviewer: User;
  /** ID người bán được đánh giá */
  sellerId: string;
  /** Điểm đánh giá (1-5 sao) */
  rating: number;
  /** Nhận xét bằng văn bản */
  comment: string;
  /** Thời gian đánh giá (ISO 8601) */
  createdAt: string;
}

/**
 * Tổng hợp đánh giá của một người bán.
 */
export interface SellerRating {
  /** Tổng số đánh giá */
  totalReviews: number;
  /** Điểm trung bình (1.0 - 5.0) */
  averageRating: number;
  /** Phân bổ theo số sao */
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Payload tạo đánh giá mới.
 */
export interface CreateReviewPayload {
  /** ID tin đăng */
  listingId: string;
  /** ID người bán */
  sellerId: string;
  /** Điểm đánh giá (1-5) */
  rating: number;
  /** Nhận xét */
  comment: string;
}
