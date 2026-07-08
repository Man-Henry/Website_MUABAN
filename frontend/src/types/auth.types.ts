/**
 * @fileoverview Định nghĩa các kiểu dữ liệu liên quan đến xác thực người dùng.
 * Bao gồm thông tin người dùng, payload đăng nhập/đăng ký,
 * phản hồi xác thực và trạng thái Redux cho module auth.
 */

/**
 * Thông tin cơ bản của người dùng.
 * Được sử dụng xuyên suốt ứng dụng để hiển thị thông tin người dùng.
 */
export interface User {
  /** Mã định danh duy nhất của người dùng */
  id: string;
  /** Địa chỉ email của người dùng */
  email: string;
  /** Tên hiển thị của người dùng */
  displayName: string;
  /** URL ảnh đại diện (không bắt buộc) */
  avatar?: string;
  /** Trạng thái online (không bắt buộc, phục vụ cho chat) */
  isOnline?: boolean;
}

/**
 * Dữ liệu gửi lên server khi đăng ký tài khoản mới.
 */
export interface RegisterPayload {
  /** Địa chỉ email đăng ký */
  email: string;
  /** Mật khẩu (tối thiểu 8 ký tự, phải có chữ hoa và số) */
  password: string;
  /** Tên hiển thị (2-50 ký tự) */
  displayName: string;
}

/**
 * Dữ liệu gửi lên server khi đăng nhập.
 */
export interface LoginPayload {
  /** Địa chỉ email đã đăng ký */
  email: string;
  /** Mật khẩu tài khoản */
  password: string;
}

/**
 * Phản hồi từ server sau khi đăng nhập/đăng ký thành công.
 * accessToken được lưu trong bộ nhớ (in-memory), KHÔNG lưu vào localStorage.
 * refreshToken được gửi qua HttpOnly cookie bởi server.
 */
export interface AuthResponse {
  /** Thông tin người dùng đã xác thực */
  user: User;
  /** JWT access token (chỉ lưu trong bộ nhớ để tránh XSS) */
  accessToken: string;
}

/**
 * Trạng thái xác thực trong Redux store.
 * Quản lý trạng thái đăng nhập, thông tin người dùng và các trạng thái loading/error.
 */
export interface AuthState {
  /** Người dùng đã đăng nhập hay chưa */
  isAuthenticated: boolean;
  /** Thông tin người dùng hiện tại (null nếu chưa đăng nhập) */
  user: User | null;
  /** Đang xử lý yêu cầu xác thực (bao gồm kiểm tra phiên khi khởi động) */
  isLoading: boolean;
  /** Thông báo lỗi bằng tiếng Việt (null nếu không có lỗi) */
  error: string | null;
}
