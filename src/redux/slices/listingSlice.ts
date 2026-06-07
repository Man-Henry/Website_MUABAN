/**
 * @fileoverview Redux slice quản lý trạng thái tin đăng sản phẩm.
 *
 * Luồng hoạt động:
 * 1. Tải danh sách → dispatch fetchListings() với params filter/search
 * 2. Xem chi tiết → dispatch fetchListingById(id)
 * 3. Tạo tin mới → dispatch createNewListing(formData)
 * 4. Xoá tin → dispatch removeListing(id)
 *
 * State quản lý:
 * - listings: Danh sách tin đăng hiện tại (paginated)
 * - selectedListing: Chi tiết tin đăng đang xem
 * - pagination: Thông tin phân trang
 * - filters: Bộ lọc hiện tại
 * - isLoading / error: Trạng thái tải
 */

import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Listing, ListingCategory, ListingCondition } from '../../types/listing.types';
import listingService from '../../services/listingService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Bộ lọc tin đăng */
export interface ListingFilters {
  category?: ListingCategory;
  condition?: ListingCondition;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc';
}

/** Thông tin phân trang */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/** Trạng thái listing trong Redux store */
export interface ListingState {
  /** Danh sách tin đăng hiện tại */
  listings: Listing[];
  /** Chi tiết tin đang xem (null nếu chưa chọn) */
  selectedListing: Listing | null;
  /** Thông tin phân trang */
  pagination: PaginationInfo;
  /** Bộ lọc hiện tại */
  filters: ListingFilters;
  /** Đang tải danh sách */
  isLoading: boolean;
  /** Đang tải chi tiết */
  isDetailLoading: boolean;
  /** Đang tạo tin mới */
  isCreating: boolean;
  /** Thông báo lỗi (null nếu không có) */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const initialState: ListingState = {
  listings: [],
  selectedListing: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  },
  filters: {
    sort: 'newest',
  },
  isLoading: false,
  isDetailLoading: false,
  isCreating: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

/**
 * Tải danh sách tin đăng với bộ lọc và phân trang.
 */
export const fetchListings = createAsyncThunk(
  'listing/fetchListings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await listingService.getListings();
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || 'Không thể tải danh sách sản phẩm.'
        );
      }
      return rejectWithValue('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }
);

/**
 * Tải chi tiết một tin đăng theo ID.
 */
export const fetchListingById = createAsyncThunk(
  'listing/fetchListingById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await listingService.getListing(id);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError.response?.status === 404) {
          return rejectWithValue('Tin đăng không tồn tại hoặc đã bị xoá.');
        }
        return rejectWithValue(
          axiosError.response?.data?.message || 'Không thể tải thông tin sản phẩm.'
        );
      }
      return rejectWithValue('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }
);

/**
 * Tạo tin đăng mới.
 * Nhận FormData để hỗ trợ upload hình ảnh.
 */
export const createNewListing = createAsyncThunk(
  'listing/createNewListing',
  async (payload: FormData, { rejectWithValue }) => {
    try {
      const data = await listingService.createListing(payload);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || 'Đăng tin thất bại. Vui lòng thử lại.'
        );
      }
      return rejectWithValue('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }
);

/**
 * Xoá tin đăng theo ID.
 */
export const removeListing = createAsyncThunk(
  'listing/removeListing',
  async (id: string, { rejectWithValue }) => {
    try {
      await listingService.deleteListing(id);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || 'Xoá tin thất bại. Vui lòng thử lại.'
        );
      }
      return rejectWithValue('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const listingSlice = createSlice({
  name: 'listing',
  initialState,
  reducers: {
    /** Cập nhật bộ lọc */
    setFilters: (state, action: PayloadAction<Partial<ListingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset về trang 1 khi thay đổi filter
    },
    /** Xoá bộ lọc */
    clearFilters: (state) => {
      state.filters = { sort: 'newest' };
      state.pagination.currentPage = 1;
    },
    /** Thay đổi trang */
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    /** Xoá tin đăng đang xem */
    clearSelectedListing: (state) => {
      state.selectedListing = null;
    },
    /** Xoá thông báo lỗi */
    clearListingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // -----------------------------------------------------------------------
    // fetchListings
    // -----------------------------------------------------------------------
    builder
      .addCase(fetchListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listings = action.payload;
        state.pagination.totalItems = action.payload.length;
        state.pagination.totalPages = Math.ceil(
          action.payload.length / state.pagination.itemsPerPage
        );
        state.error = null;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) || 'Không thể tải danh sách sản phẩm.';
      });

    // -----------------------------------------------------------------------
    // fetchListingById
    // -----------------------------------------------------------------------
    builder
      .addCase(fetchListingById.pending, (state) => {
        state.isDetailLoading = true;
        state.error = null;
      })
      .addCase(fetchListingById.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.selectedListing = action.payload;
        state.error = null;
      })
      .addCase(fetchListingById.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.selectedListing = null;
        state.error =
          (action.payload as string) || 'Không thể tải thông tin sản phẩm.';
      });

    // -----------------------------------------------------------------------
    // createNewListing
    // -----------------------------------------------------------------------
    builder
      .addCase(createNewListing.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createNewListing.fulfilled, (state, action) => {
        state.isCreating = false;
        state.listings.unshift(action.payload);
        state.pagination.totalItems += 1;
        state.error = null;
      })
      .addCase(createNewListing.rejected, (state, action) => {
        state.isCreating = false;
        state.error =
          (action.payload as string) || 'Đăng tin thất bại. Vui lòng thử lại.';
      });

    // -----------------------------------------------------------------------
    // removeListing
    // -----------------------------------------------------------------------
    builder
      .addCase(removeListing.pending, (state) => {
        state.error = null;
      })
      .addCase(removeListing.fulfilled, (state, action) => {
        state.listings = state.listings.filter((l) => l.id !== action.payload);
        state.pagination.totalItems -= 1;
        if (state.selectedListing?.id === action.payload) {
          state.selectedListing = null;
        }
      })
      .addCase(removeListing.rejected, (state, action) => {
        state.error =
          (action.payload as string) || 'Xoá tin thất bại. Vui lòng thử lại.';
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPage,
  clearSelectedListing,
  clearListingError,
} = listingSlice.actions;

export default listingSlice.reducer;
