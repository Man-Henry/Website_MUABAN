/**
 * @fileoverview Cấu hình Axios instance cho toàn bộ ứng dụng.
 *
 * Bảo mật:
 * - accessToken được lưu trong biến JavaScript (in-memory), KHÔNG BAO GIỜ lưu vào
 *   localStorage/sessionStorage để tránh tấn công XSS.
 * - refreshToken được quản lý qua HttpOnly cookie bởi server, tự động gửi
 *   nhờ withCredentials: true.
 *
 * Interceptors:
 * - Request: Tự động đính kèm Authorization header nếu có accessToken.
 * - Response: Khi gặp lỗi 401, thử refresh token. Nếu thành công, retry
 *   request gốc. Nếu thất bại, chuyển hướng về trang đăng nhập.
 *
 * Cơ chế hàng đợi (queue):
 * - Khi nhiều request cùng nhận 401, chỉ có MỘT request refresh được gửi.
 * - Các request khác sẽ đợi trong hàng đợi và được retry sau khi refresh thành công.
 */

import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

// ---------------------------------------------------------------------------
// Quản lý Access Token trong bộ nhớ (in-memory)
// ---------------------------------------------------------------------------

/** Access token hiện tại, chỉ tồn tại trong bộ nhớ JavaScript */
let accessToken: string | null = null;

/**
 * Lưu access token vào bộ nhớ.
 * Được gọi sau khi đăng nhập/đăng ký/refresh thành công.
 * @param token - JWT access token từ server
 */
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

/**
 * Lấy access token hiện tại từ bộ nhớ.
 * @returns Access token hoặc null nếu chưa đăng nhập
 */
export const getAccessToken = (): string | null => {
  return accessToken;
};

/**
 * Xoá access token khỏi bộ nhớ.
 * Được gọi khi đăng xuất hoặc khi refresh token thất bại.
 */
export const clearAccessToken = (): void => {
  accessToken = null;
};

// ---------------------------------------------------------------------------
// Tạo Axios instance
// ---------------------------------------------------------------------------

/**
 * Axios instance chính cho toàn bộ ứng dụng.
 * - baseURL: lấy từ biến môi trường VITE_API_URL hoặc mặc định '/api'
 * - withCredentials: true để gửi HttpOnly cookie tự động
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request Interceptor
// ---------------------------------------------------------------------------

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Cơ chế hàng đợi để tránh gọi refresh nhiều lần đồng thời
// ---------------------------------------------------------------------------

/** Đánh dấu có đang refresh token hay không */
let isRefreshing = false;

/** Kiểu callback cho hàng đợi chờ refresh */
type QueueCallback = (token: string | null) => void;

/** Hàng đợi các request đang chờ refresh token hoàn tất */
let failedQueue: Array<{
  resolve: QueueCallback;
  reject: (error: unknown) => void;
}> = [];

/**
 * Xử lý hàng đợi sau khi refresh token hoàn tất.
 * @param error - Lỗi nếu refresh thất bại, null nếu thành công
 * @param token - Token mới nếu refresh thành công
 */
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// ---------------------------------------------------------------------------
// Response Interceptor
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Chỉ xử lý lỗi 401 và chưa retry
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Không retry cho endpoint refresh để tránh vòng lặp vô hạn
    if (originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    // Nếu đang refresh, thêm request vào hàng đợi
    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Gọi refresh token - cookie HttpOnly tự động được gửi kèm
      const response = await api.post<{ accessToken: string }>('/auth/refresh');
      const newToken = response.data.accessToken;

      setAccessToken(newToken);
      processQueue(null, newToken);

      // Retry request gốc với token mới
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAccessToken();

      // Chuyển hướng về trang đăng nhập
      window.location.href = '/dang-nhap';

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
