/**
 * @fileoverview Redux slice quản lý trạng thái đánh giá sản phẩm/người bán.
 *
 * Luồng hoạt động:
 * 1. Xem chi tiết sản phẩm → dispatch fetchListingReviews(listingId)
 * 2. Gửi đánh giá mới → dispatch submitReview(payload)
 * 3. Xem đánh giá người bán → dispatch fetchSellerRating(sellerId)
 *
 * State quản lý:
 * - reviews: Danh sách đánh giá hiện tại
 * - sellerRating: Tổng hợp rating người bán
 * - isLoading / isSubmitting / error: Trạng thái tải
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Review, SellerRating, CreateReviewPayload } from '../../types/review.types';
// ✅ REAL API MODE: sử dụng service gọi API thật
import reviewService from '../../services/reviewService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Trạng thái review trong Redux store */
export interface ReviewState {
  /** Danh sách đánh giá của listing đang xem */
  reviews: Review[];
  /** Tổng hợp rating của người bán */
  sellerRating: SellerRating | null;
  /** Đang tải danh sách reviews */
  isLoading: boolean;
  /** Đang gửi đánh giá mới */
  isSubmitting: boolean;
  /** Thông báo lỗi (null nếu không có) */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const initialState: ReviewState = {
  reviews: [],
  sellerRating: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

/**
 * Tải danh sách đánh giá của một tin đăng.
 */
export const fetchListingReviews = createAsyncThunk(
  'review/fetchListingReviews',
  async (listingId: string, { rejectWithValue }) => {
    try {
      const data = await reviewService.getListingReviews(listingId);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || 'Không thể tải đánh giá.'
        );
      }
      return rejectWithValue('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }
);

/**
 * Tải tổng hợp rating của người bán.
 */
export const fetchSellerRating = createAsyncThunk(
  'review/fetchSellerRating',
  async (sellerId: string, { rejectWithValue }) => {
    try {
      const data = await reviewService.getSellerRating(sellerId);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || 'Không thể tải rating người bán.'
        );
      }
      return rejectWithValue('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }
);

/**
 * Gửi đánh giá mới.
 */
export const submitReview = createAsyncThunk(
  'review/submitReview',
  async (payload: CreateReviewPayload, { rejectWithValue }) => {
    try {
      const data = await reviewService.createReview(payload);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.'
        );
      }
      return rejectWithValue('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    /** Xoá danh sách reviews (khi rời trang chi tiết) */
    clearReviews: (state) => {
      state.reviews = [];
      state.sellerRating = null;
      state.error = null;
    },
    /** Xoá thông báo lỗi */
    clearReviewError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // -----------------------------------------------------------------------
    // fetchListingReviews
    // -----------------------------------------------------------------------
    builder
      .addCase(fetchListingReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchListingReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
        state.error = null;
      })
      .addCase(fetchListingReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) || 'Không thể tải đánh giá.';
      });

    // -----------------------------------------------------------------------
    // fetchSellerRating
    // -----------------------------------------------------------------------
    builder
      .addCase(fetchSellerRating.pending, () => {
        // Silent loading — no UI indicator for seller rating
      })
      .addCase(fetchSellerRating.fulfilled, (state, action) => {
        state.sellerRating = action.payload;
      })
      .addCase(fetchSellerRating.rejected, () => {
        // Silently fail — seller rating is supplementary
      });

    // -----------------------------------------------------------------------
    // submitReview
    // -----------------------------------------------------------------------
    builder
      .addCase(submitReview.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.reviews.unshift(action.payload);
        state.error = null;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error =
          (action.payload as string) || 'Gửi đánh giá thất bại. Vui lòng thử lại.';
      });
  },
});

export const { clearReviews, clearReviewError } = reviewSlice.actions;

export default reviewSlice.reducer;
