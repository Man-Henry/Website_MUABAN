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
import type { Listing, ListingCategory, ListingCondition, UpdateListingStatusPayload } from '../../types/listing.types';
// ✅ REAL API MODE: sử dụng service gọi API thật
import listingService, { type ListingQueryParams } from '../../services/listingService';

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
  /** Đang cập nhật tin đăng */
  isUpdating: boolean;
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
  isUpdating: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

/**
 * Tải danh sách tin đăng với bộ lọc và phân trang.
 * Nhận tham số query tùy chọn để lọc/sắp xếp/phân trang phía server.
 */
export const fetchListings = createAsyncThunk(
  'listing/fetchListings',
  async (params: ListingQueryParams | void, { rejectWithValue }) => {
    try {
      const data = await listingService.getListings(params || undefined);
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
 * Tải danh sách tin đăng của một người dùng (bao gồm cả sản phẩm đã bán).
 */
export const fetchMyListings = createAsyncThunk(
  'listing/fetchMyListings',
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await listingService.getListingsByUser(userId);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || 'Không thể tải danh sách tin đăng.'
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

/**
 * Cập nhật trạng thái hiển thị của tin đăng.
 */
export const updateListingStatus = createAsyncThunk(
  'listing/updateListingStatus',
  async (payload: UpdateListingStatusPayload, { rejectWithValue }) => {
    try {
      const data = await listingService.updateListingStatus(payload.listingId, payload.status);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || 'Cập nhật trạng thái thất bại. Vui lòng thử lại.'
        );
      }
      return rejectWithValue('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }
);

/**
 * Cập nhật thông tin tin đăng.
 * Nhận id và FormData chứa thông tin cập nhật.
 */
export const editListing = createAsyncThunk(
  'listing/editListing',
  async ({ id, payload }: { id: string; payload: FormData }, { rejectWithValue }) => {
    try {
      const data = await listingService.updateListing(id, payload);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        return rejectWithValue(
          axiosError.response?.data?.message || 'Cập nhật tin thất bại. Vui lòng thử lại.'
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
        state.listings = action.payload.data;
        state.pagination.totalItems = action.payload.pagination.total;
        state.pagination.totalPages = action.payload.pagination.totalPages;
        state.pagination.currentPage = action.payload.pagination.page;
        state.error = null;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) || 'Không thể tải danh sách sản phẩm.';
      });

    // -----------------------------------------------------------------------
    // fetchMyListings
    // -----------------------------------------------------------------------
    builder
      .addCase(fetchMyListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listings = action.payload;
        state.pagination.totalItems = action.payload.length;
        state.pagination.totalPages = Math.ceil(
          action.payload.length / state.pagination.itemsPerPage
        );
        state.error = null;
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) || 'Không thể tải danh sách tin đăng.';
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

    // -----------------------------------------------------------------------
    // updateListingStatus
    // -----------------------------------------------------------------------
    builder
      .addCase(updateListingStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateListingStatus.fulfilled, (state, action) => {
        const updatedListing = action.payload;
        // Update in list
        const index = state.listings.findIndex((l) => l.id === updatedListing.id);
        if (index !== -1) {
          state.listings[index] = updatedListing;
        }
        // Update selected if applicable
        if (state.selectedListing?.id === updatedListing.id) {
          state.selectedListing = updatedListing;
        }
      })
      .addCase(updateListingStatus.rejected, (state, action) => {
        state.error =
          (action.payload as string) || 'Cập nhật trạng thái thất bại. Vui lòng thử lại.';
      });

    // -----------------------------------------------------------------------
    // editListing
    // -----------------------------------------------------------------------
    builder
      .addCase(editListing.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(editListing.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedListing = action.payload;
        // Update in list
        const index = state.listings.findIndex((l) => l.id === updatedListing.id);
        if (index !== -1) {
          state.listings[index] = updatedListing;
        }
        // Update selected if applicable
        if (state.selectedListing?.id === updatedListing.id) {
          state.selectedListing = updatedListing;
        }
        state.error = null;
      })
      .addCase(editListing.rejected, (state, action) => {
        state.isUpdating = false;
        state.error =
          (action.payload as string) || 'Cập nhật tin thất bại. Vui lòng thử lại.';
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
