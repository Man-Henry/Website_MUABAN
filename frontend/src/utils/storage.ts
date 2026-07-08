/**
 * @fileoverview Tiện ích đọc/ghi localStorage cho dữ liệu KHÔNG NHẠY CẢM.
 *
 * ⚠️ CẢNH BÁO BẢO MẬT:
 * - KHÔNG BAO GIỜ lưu token, mật khẩu, hoặc thông tin xác thực vào đây.
 * - accessToken được lưu in-memory (xem src/services/api.ts).
 * - refreshToken được quản lý qua HttpOnly cookie bởi server.
 *
 * Chỉ sử dụng cho:
 * - Tuỳ chọn giao diện (theme, ngôn ngữ)
 * - Bộ lọc / tuỳ chọn tìm kiếm
 * - Lịch sử tìm kiếm
 * - Dữ liệu form tạm thời (draft)
 */

/**
 * Đọc giá trị từ localStorage và parse thành kiểu T.
 * Trả về null nếu key không tồn tại hoặc giá trị không thể parse.
 *
 * @typeParam T - Kiểu dữ liệu mong muốn
 * @param key - Khoá localStorage
 * @returns Giá trị đã parse hoặc null
 *
 * @example
 * // Đọc tuỳ chọn theme
 * const theme = getItem<'light' | 'dark'>('theme');
 *
 * // Đọc bộ lọc tìm kiếm
 * const filters = getItem<SearchFilters>('searchFilters');
 */
export const getItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch {
    // JSON.parse thất bại hoặc localStorage không khả dụng
    // (ví dụ: chế độ ẩn danh trên một số trình duyệt)
    console.warn(
      `[storage] Không thể đọc giá trị cho key "${key}" từ localStorage.`
    );
    return null;
  }
};

/**
 * Lưu giá trị vào localStorage dưới dạng JSON.
 *
 * @typeParam T - Kiểu dữ liệu cần lưu
 * @param key - Khoá localStorage
 * @param value - Giá trị cần lưu (sẽ được JSON.stringify)
 *
 * @example
 * // Lưu tuỳ chọn theme
 * setItem('theme', 'dark');
 *
 * // Lưu bộ lọc tìm kiếm
 * setItem('searchFilters', { category: 'fashion', minPrice: 0 });
 */
export const setItem = <T>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch {
    // JSON.stringify thất bại hoặc localStorage đầy/không khả dụng
    console.warn(
      `[storage] Không thể lưu giá trị cho key "${key}" vào localStorage.`
    );
  }
};

/**
 * Xoá một giá trị khỏi localStorage.
 *
 * @param key - Khoá localStorage cần xoá
 *
 * @example
 * removeItem('searchFilters');
 */
export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(
      `[storage] Không thể xoá key "${key}" khỏi localStorage.`
    );
  }
};
