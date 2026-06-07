/**
 * @fileoverview Các hàm kiểm tra và xác thực dữ liệu đầu vào.
 * Tất cả thông báo lỗi đều bằng tiếng Việt.
 *
 * Mỗi hàm trả về đối tượng ValidationResult:
 * - valid: true nếu dữ liệu hợp lệ
 * - error: Thông báo lỗi bằng tiếng Việt (chỉ có khi valid = false)
 */

/**
 * Kết quả xác thực dữ liệu đầu vào.
 */
export interface ValidationResult {
  /** Dữ liệu có hợp lệ không */
  valid: boolean;
  /** Thông báo lỗi bằng tiếng Việt (chỉ khi valid = false) */
  error?: string;
}

/**
 * Biểu thức chính quy kiểm tra email theo chuẩn RFC 5322 (đơn giản hoá).
 * Hỗ trợ hầu hết các định dạng email phổ biến bao gồm:
 * - Chữ cái, số, dấu chấm, gạch dưới, gạch ngang trong phần local
 * - Tên miền phải có ít nhất 2 ký tự ở phần TLD
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

/**
 * Biểu thức chính quy kiểm tra mật khẩu có chứa ít nhất một chữ hoa.
 */
const UPPERCASE_REGEX = /[A-Z]/;

/**
 * Biểu thức chính quy kiểm tra mật khẩu có chứa ít nhất một chữ số.
 */
const NUMBER_REGEX = /[0-9]/;

/**
 * Kiểm tra tính hợp lệ của địa chỉ email.
 * Sử dụng biểu thức chính quy theo chuẩn RFC 5322.
 *
 * @param email - Địa chỉ email cần kiểm tra
 * @returns Kết quả xác thực
 *
 * @example
 * validateEmail('user@example.com'); // { valid: true }
 * validateEmail('invalid-email');     // { valid: false, error: '...' }
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Vui lòng nhập địa chỉ email.' };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { valid: false, error: 'Địa chỉ email không hợp lệ.' };
  }

  return { valid: true };
};

/**
 * Kiểm tra tính hợp lệ của mật khẩu.
 * Yêu cầu:
 * - Tối thiểu 8 ký tự
 * - Phải chứa ít nhất 1 chữ hoa
 * - Phải chứa ít nhất 1 chữ số
 *
 * @param password - Mật khẩu cần kiểm tra
 * @returns Kết quả xác thực
 *
 * @example
 * validatePassword('Abc12345');  // { valid: true }
 * validatePassword('abc');       // { valid: false, error: '...' }
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Vui lòng nhập mật khẩu.' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự.' };
  }

  if (!UPPERCASE_REGEX.test(password)) {
    return {
      valid: false,
      error: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa.',
    };
  }

  if (!NUMBER_REGEX.test(password)) {
    return {
      valid: false,
      error: 'Mật khẩu phải chứa ít nhất một chữ số.',
    };
  }

  return { valid: true };
};

/**
 * Kiểm tra tính hợp lệ của tên hiển thị.
 * Yêu cầu: 2-50 ký tự (đã loại bỏ khoảng trắng thừa).
 *
 * @param name - Tên hiển thị cần kiểm tra
 * @returns Kết quả xác thực
 *
 * @example
 * validateDisplayName('Nguyễn Văn A'); // { valid: true }
 * validateDisplayName('A');            // { valid: false, error: '...' }
 */
export const validateDisplayName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Vui lòng nhập tên hiển thị.' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { valid: false, error: 'Tên hiển thị phải có ít nhất 2 ký tự.' };
  }

  if (trimmedName.length > 50) {
    return {
      valid: false,
      error: 'Tên hiển thị không được vượt quá 50 ký tự.',
    };
  }

  return { valid: true };
};

/**
 * Kiểm tra trường bắt buộc không được để trống.
 *
 * @param value - Giá trị cần kiểm tra
 * @param fieldName - Tên trường (hiển thị trong thông báo lỗi)
 * @returns Kết quả xác thực
 *
 * @example
 * validateRequired('Áo thun', 'Tiêu đề'); // { valid: true }
 * validateRequired('', 'Tiêu đề');         // { valid: false, error: 'Vui lòng nhập Tiêu đề.' }
 */
export const validateRequired = (
  value: string,
  fieldName: string
): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: `Vui lòng nhập ${fieldName}.` };
  }

  return { valid: true };
};

/**
 * Kiểm tra tính hợp lệ của giá bán.
 * Yêu cầu: phải là số dương (lớn hơn 0).
 *
 * @param price - Giá cần kiểm tra (VNĐ)
 * @returns Kết quả xác thực
 *
 * @example
 * validatePrice(150000); // { valid: true }
 * validatePrice(-1);     // { valid: false, error: '...' }
 * validatePrice(NaN);    // { valid: false, error: '...' }
 */
export const validatePrice = (price: number): ValidationResult => {
  if (price === null || price === undefined || isNaN(price)) {
    return { valid: false, error: 'Vui lòng nhập giá sản phẩm.' };
  }

  if (!isFinite(price)) {
    return { valid: false, error: 'Giá sản phẩm không hợp lệ.' };
  }

  if (price <= 0) {
    return { valid: false, error: 'Giá sản phẩm phải là số dương.' };
  }

  return { valid: true };
};

/**
 * Kiểm tra tính hợp lệ của mô tả sản phẩm.
 * Yêu cầu: 10-500 ký tự (đã loại bỏ khoảng trắng thừa).
 *
 * @param desc - Mô tả cần kiểm tra
 * @returns Kết quả xác thực
 *
 * @example
 * validateDescription('Áo thun cotton, còn mới, size L...'); // { valid: true }
 * validateDescription('Ngắn');                                // { valid: false, error: '...' }
 */
export const validateDescription = (desc: string): ValidationResult => {
  if (!desc || desc.trim().length === 0) {
    return { valid: false, error: 'Vui lòng nhập mô tả sản phẩm.' };
  }

  const trimmedDesc = desc.trim();

  if (trimmedDesc.length < 10) {
    return {
      valid: false,
      error: 'Mô tả sản phẩm phải có ít nhất 10 ký tự.',
    };
  }

  if (trimmedDesc.length > 500) {
    return {
      valid: false,
      error: 'Mô tả sản phẩm không được vượt quá 500 ký tự.',
    };
  }

  return { valid: true };
};
