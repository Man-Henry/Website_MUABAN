/**
 * @fileoverview Service xử lý các thao tác CRUD cho tin đăng sản phẩm.
 * Sử dụng Axios instance đã cấu hình sẵn interceptors xác thực.
 *
 * Lưu ý:
 * - createListing nhận FormData để hỗ trợ upload hình ảnh
 * - Content-Type sẽ tự động được set thành multipart/form-data khi gửi FormData
 * - getListings hỗ trợ query params cho search/filter/sort/pagination
 */

import type { Listing, ListingCategory, ListingCondition } from '../types/listing.types';
import api from './api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Query params cho listing API */
export interface ListingQueryParams {
  /** Từ khoá tìm kiếm */
  search?: string;
  /** Lọc theo danh mục */
  category?: ListingCategory;
  /** Lọc theo tình trạng */
  condition?: ListingCondition;
  /** Giá tối thiểu (VNĐ) */
  minPrice?: number;
  /** Giá tối đa (VNĐ) */
  maxPrice?: number;
  /** Sắp xếp */
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc';
  /** Trang hiện tại (1-indexed) */
  page?: number;
  /** Số lượng mỗi trang */
  limit?: number;
}

/** Phản hồi danh sách phân trang từ server */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Tạo tin đăng mới trên sàn giao dịch.
 * Gửi dữ liệu dưới dạng FormData để hỗ trợ upload file hình ảnh.
 * Axios tự động set Content-Type: multipart/form-data khi payload là FormData.
 *
 * @param payload - FormData chứa thông tin tin đăng và file hình ảnh
 * @returns Tin đăng vừa được tạo
 * @throws AxiosError nếu dữ liệu không hợp lệ hoặc chưa đăng nhập
 */
const createListing = async (payload: FormData): Promise<Listing> => {
  const response = await api.post<Listing>('/listings', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Lấy danh sách tin đăng với hỗ trợ search, filter, sort, pagination.
 * Endpoint công khai, không yêu cầu xác thực.
 *
 * @param params - Query params (search, category, condition, sort, page, limit)
 * @returns Mảng các tin đăng (hoặc PaginatedResponse nếu server hỗ trợ)
 * @throws AxiosError nếu có lỗi server
 *
 * @example
 * // Tìm kiếm
 * getListings({ search: 'áo thun', category: 'fashion', sort: 'newest' });
 *
 * // Lọc theo giá
 * getListings({ minPrice: 100000, maxPrice: 500000 });
 */
const getListings = async (params?: ListingQueryParams): Promise<PaginatedResponse<Listing>> => {
  // Xây dựng query params, loại bỏ giá trị undefined
  const queryParams: Record<string, string> = {};

  if (params?.search) queryParams.search = params.search;
  if (params?.category) queryParams.category = params.category;
  if (params?.condition) queryParams.condition = params.condition;
  if (params?.minPrice !== undefined) queryParams.minPrice = String(params.minPrice);
  if (params?.maxPrice !== undefined) queryParams.maxPrice = String(params.maxPrice);
  if (params?.sort) queryParams.sort = params.sort;
  if (params?.page !== undefined) queryParams.page = String(params.page);
  if (params?.limit !== undefined) queryParams.limit = String(params.limit);

  const response = await api.get<PaginatedResponse<Listing>>('/listings', { params: queryParams });
  return response.data;
};

/**
 * Tìm kiếm tin đăng theo từ khoá.
 * Shorthand cho getListings với tham số search.
 *
 * @param query - Từ khoá tìm kiếm
 * @param params - Các tham số bổ sung (filter, sort, pagination)
 * @returns Mảng các tin đăng phù hợp
 */
const searchListings = async (
  query: string,
  params?: Omit<ListingQueryParams, 'search'>
): Promise<PaginatedResponse<Listing>> => {
  return getListings({ ...params, search: query });
};

/**
 * Lấy danh sách tin đăng của một người dùng.
 *
 * @param userId - Mã người dùng
 * @returns Mảng tin đăng của người dùng đó
 * @throws AxiosError nếu người dùng không tồn tại
 */
const getListingsByUser = async (userId: string): Promise<Listing[]> => {
  const response = await api.get<Listing[]>(`/users/${userId}/listings`);
  return response.data;
};

/**
 * Lấy chi tiết một tin đăng theo ID.
 *
 * @param id - Mã định danh của tin đăng
 * @returns Thông tin chi tiết tin đăng
 * @throws AxiosError nếu tin đăng không tồn tại (404)
 */
const getListing = async (id: string): Promise<Listing> => {
  const response = await api.get<Listing>(`/listings/${id}`);
  return response.data;
};

/**
 * Xoá tin đăng theo ID.
 * Chỉ người đăng tin mới có quyền xoá.
 *
 * @param id - Mã định danh của tin đăng cần xoá
 * @throws AxiosError nếu không có quyền (403) hoặc tin đăng không tồn tại (404)
 */
const deleteListing = async (id: string): Promise<void> => {
  await api.delete(`/listings/${id}`);
};

/**
 * Cập nhật trạng thái hiển thị của tin đăng.
 *
 * @param id - Mã định danh của tin đăng
 * @param status - Trạng thái mới ('active' | 'sold' | 'hidden')
 * @returns Tin đăng đã cập nhật
 */
const updateListingStatus = async (id: string, status: import('../types/listing.types').ListingStatus): Promise<Listing> => {
  const response = await api.patch<Listing>(`/listings/${id}/status`, { status });
  return response.data;
};

/**
 * Cập nhật thông tin tin đăng.
 * Gửi dữ liệu dưới dạng FormData để hỗ trợ upload file hình ảnh mới.
 *
 * @param id - Mã định danh của tin đăng cần cập nhật
 * @param payload - FormData chứa thông tin cập nhật và file hình ảnh mới
 * @returns Tin đăng đã cập nhật
 * @throws AxiosError nếu không có quyền (403) hoặc tin đăng không tồn tại (404)
 */
const updateListing = async (id: string, payload: FormData): Promise<Listing> => {
  const response = await api.put<Listing>(`/listings/${id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/** Service quản lý tin đăng sản phẩm */
const listingService = {
  createListing,
  getListings,
  searchListings,
  getListingsByUser,
  getListing,
  updateListingStatus,
  updateListing,
  deleteListing,
} as const;

export default listingService;

