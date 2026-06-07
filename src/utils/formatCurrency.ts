/**
 * @fileoverview Hàm định dạng và phân tích tiền tệ Việt Nam Đồng (VNĐ).
 *
 * Quy ước:
 * - Sử dụng dấu chấm (.) làm phân cách hàng nghìn (theo chuẩn Việt Nam)
 * - Đơn vị tiền tệ: VNĐ (viết tắt của Việt Nam Đồng)
 * - Không sử dụng phần thập phân vì VNĐ không có đơn vị nhỏ hơn đồng
 */

/**
 * Định dạng số tiền thành chuỗi tiền tệ Việt Nam.
 * Sử dụng dấu chấm làm phân cách hàng nghìn theo chuẩn Việt Nam.
 *
 * @param amount - Số tiền cần định dạng (VNĐ)
 * @returns Chuỗi đã định dạng, ví dụ: '150.000 VNĐ'
 *
 * @example
 * formatVND(150000);   // '150.000 VNĐ'
 * formatVND(1500000);  // '1.500.000 VNĐ'
 * formatVND(0);        // '0 VNĐ'
 * formatVND(500);      // '500 VNĐ'
 */
export const formatVND = (amount: number): string => {
  // Sử dụng Intl.NumberFormat với locale vi-VN để đảm bảo đúng chuẩn phân cách
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);

  return `${formatted} VNĐ`;
};

/**
 * Phân tích chuỗi tiền tệ VNĐ thành số.
 * Loại bỏ ký hiệu tiền tệ, dấu phân cách và khoảng trắng.
 *
 * @param formatted - Chuỗi tiền tệ đã định dạng, ví dụ: '150.000 VNĐ'
 * @returns Giá trị số, ví dụ: 150000. Trả về NaN nếu chuỗi không hợp lệ.
 *
 * @example
 * parseVND('150.000 VNĐ');  // 150000
 * parseVND('1.500.000 VNĐ'); // 1500000
 * parseVND('500');            // 500
 * parseVND('');               // NaN
 */
export const parseVND = (formatted: string): number => {
  if (!formatted || formatted.trim().length === 0) {
    return NaN;
  }

  // Loại bỏ ký hiệu VNĐ, đ, ₫, khoảng trắng và dấu chấm phân cách
  const cleaned = formatted
    .replace(/VNĐ/gi, '')
    .replace(/[đ₫]/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '')
    .trim();

  if (cleaned.length === 0) {
    return NaN;
  }

  const result = Number(cleaned);
  return result;
};
