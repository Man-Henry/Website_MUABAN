/**
 * @fileoverview Service xử lý các thao tác xác thực người dùng.
 * Tất cả các hàm đều sử dụng Axios instance đã cấu hình sẵn
 * interceptors và withCredentials cho HttpOnly cookie.
 *
 * Luồng xác thực:
 * 1. Đăng nhập/Đăng ký → Server trả về accessToken + set HttpOnly cookie
 * 2. accessToken lưu in-memory, refreshToken trong HttpOnly cookie
 * 3. Khi accessToken hết hạn → interceptor tự động refresh qua cookie
 * 4. Đăng xuất → Xoá token in-memory + server xoá HttpOnly cookie
 */

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from '../types/auth.types';
import api from './api';

/**
 * Đăng nhập bằng email và mật khẩu.
 * Server sẽ trả về accessToken trong body và set refreshToken qua HttpOnly cookie.
 *
 * @param payload - Thông tin đăng nhập (email, password)
 * @returns Thông tin người dùng và accessToken
 * @throws AxiosError nếu thông tin đăng nhập không hợp lệ
 */
const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', payload);
  return response.data;
};

/**
 * Đăng ký tài khoản mới.
 * Sau khi đăng ký thành công, người dùng được tự động đăng nhập.
 *
 * @param payload - Thông tin đăng ký (email, password, displayName)
 * @returns Thông tin người dùng mới và accessToken
 * @throws AxiosError nếu email đã tồn tại hoặc dữ liệu không hợp lệ
 */
const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', payload);
  return response.data;
};

/**
 * Đăng xuất khỏi hệ thống.
 * Server sẽ vô hiệu hoá refreshToken và xoá HttpOnly cookie.
 * Client cần xoá accessToken in-memory sau khi gọi hàm này.
 *
 * @throws AxiosError nếu có lỗi server
 */
const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

/**
 * Làm mới access token bằng refresh token trong HttpOnly cookie.
 * Được gọi tự động bởi interceptor khi access token hết hạn,
 * hoặc khi khởi động ứng dụng để kiểm tra phiên đăng nhập.
 *
 * @returns accessToken mới và thông tin người dùng
 * @throws AxiosError nếu refresh token không hợp lệ hoặc đã hết hạn
 */
const refreshToken = async (): Promise<{ accessToken: string; user: User }> => {
  const response = await api.post<{ accessToken: string; user: User }>(
    '/auth/refresh'
  );
  return response.data;
};

/**
 * Lấy thông tin người dùng hiện tại từ server.
 * Yêu cầu access token hợp lệ trong header Authorization.
 *
 * @returns Thông tin người dùng đã xác thực
 * @throws AxiosError nếu chưa đăng nhập hoặc token không hợp lệ
 */
const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

/** Service xác thực người dùng */
const authService = {
  login,
  register,
  logout,
  refreshToken,
  getMe,
} as const;

export default authService;
