/**
 * @fileoverview Định nghĩa các kiểu dữ liệu liên quan đến tin đăng sản phẩm.
 * Bao gồm hình ảnh, danh mục, tình trạng, payload tạo tin đăng
 * và cấu trúc dữ liệu đầy đủ của một tin đăng.
 */

import type { User } from './auth.types';

/**
 * Thông tin hình ảnh của tin đăng.
 * Hỗ trợ cả URL từ server và File object khi upload.
 */
export interface ListingImage {
  /** Mã định danh duy nhất của hình ảnh */
  id: string;
  /** Đường dẫn URL của hình ảnh đã upload */
  url: string;
  /** File gốc (chỉ có khi đang upload, không có sau khi lưu) */
  file?: File;
}

/**
 * Danh mục sản phẩm hỗ trợ trên sàn giao dịch bền vững.
 * - 'fashion': Thời trang
 * - 'electronics': Điện tử
 * - 'furniture': Nội thất
 * - 'household': Đồ gia dụng
 * - 'other': Khác
 */
export type ListingCategory =
  | 'fashion'
  | 'electronics'
  | 'furniture'
  | 'household'
  | 'other';

/**
 * Tình trạng sản phẩm.
 * - 'new': Mới hoàn toàn
 * - 'like-new': Như mới
 * - 'good': Tốt
 * - 'fair': Khá
 */
export type ListingCondition = 'new' | 'like-new' | 'good' | 'fair';

/**
 * Dữ liệu gửi lên server khi tạo tin đăng mới.
 * Hình ảnh được gửi dưới dạng File[] và sẽ được chuyển thành FormData.
 */
export interface CreateListingPayload {
  /** Tiêu đề tin đăng */
  title: string;
  /** Danh mục sản phẩm */
  category: ListingCategory;
  /** Mô tả chi tiết sản phẩm (10-500 ký tự) */
  description: string;
  /** Giá bán (VNĐ, phải là số dương) */
  price: number;
  /** Cho phép thương lượng giá */
  negotiable: boolean;
  /** Tình trạng sản phẩm */
  condition: ListingCondition;
  /** Danh sách file hình ảnh cần upload */
  images: File[];
}

/**
 * Cấu trúc đầy đủ của một tin đăng từ server.
 * Bao gồm thông tin sản phẩm, hình ảnh, người bán và thời gian tạo.
 */
export interface Listing {
  /** Mã định danh duy nhất của tin đăng */
  id: string;
  /** Tiêu đề tin đăng */
  title: string;
  /** Danh mục sản phẩm */
  category: ListingCategory;
  /** Mô tả chi tiết sản phẩm */
  description: string;
  /** Giá bán (VNĐ) */
  price: number;
  /** Cho phép thương lượng giá */
  negotiable: boolean;
  /** Tình trạng sản phẩm */
  condition: ListingCondition;
  /** Danh sách hình ảnh đã upload */
  images: ListingImage[];
  /** Thông tin người bán */
  seller: User;
  /** Thời gian tạo tin đăng (ISO 8601) */
  createdAt: string;
}
