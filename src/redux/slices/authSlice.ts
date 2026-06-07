/**
 * @fileoverview Redux slice quản lý trạng thái xác thực người dùng.
 *
 * Luồng hoạt động:
 * 1. Khởi động app → dispatch checkSession() để kiểm tra HttpOnly cookie
 * 2. Đăng nhập → dispatch loginUser() → lưu accessToken in-memory
 * 3. Đăng ký → dispatch registerUser() → tự động đăng nhập
 * 4. Đăng xuất → dispatch logout() → xoá token + gọi API logout
 *
 * Bảo mật:
 * - accessToken KHÔNG lưu vào Redux state (tránh DevTools leak)
 * - accessToken chỉ lưu trong biến JavaScript qua setAccessToken()
 * - refreshToken do server quản lý qua HttpOnly cookie
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type {
  AuthState,
  LoginPayload,
  RegisterPayload,
} from '../../types/auth.types';
import { clearAccessToken, setAccessToken } from '../../services/api';
import authService from '../../services/authService';

/** Trạng thái khởi tạo - isLoading: true để chờ kiểm tra phiên */
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
};

/**
 * Đăng nhập bằng email và mật khẩu.
 * Lưu accessToken vào bộ nhớ in-memory sau khi thành công.
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const data = await authService.login(payload);
      setAccessToken(data.accessToken);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        const message =
          axiosError.response?.data?.message ||
          'Đăng nhập thất bại. Vui lòng thử lại.';
        return rejectWithValue(message);
      }
      return rejectWithValue(
        'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
      );
    }
  }
);

/**
 * Đăng ký tài khoản mới.
 * Sau khi đăng ký thành công, người dùng được tự động đăng nhập.
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const data = await authService.register(payload);
      setAccessToken(data.accessToken);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        const message =
          axiosError.response?.data?.message ||
          'Đăng ký thất bại. Vui lòng thử lại.';
        return rejectWithValue(message);
      }
      return rejectWithValue(
        'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
      );
    }
  }
);

/**
 * Kiểm tra phiên đăng nhập khi khởi động ứng dụng.
 * Gọi API refresh token - nếu HttpOnly cookie còn hợp lệ,
 * server sẽ trả về accessToken mới và thông tin người dùng.
 * Nếu thất bại, người dùng sẽ ở trạng thái chưa đăng nhập.
 */
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.refreshToken();
      setAccessToken(data.accessToken);
      return data;
    } catch {
      clearAccessToken();
      return rejectWithValue('Phiên đăng nhập đã hết hạn.');
    }
  }
);

/**
 * Slice quản lý trạng thái xác thực.
 * Tất cả thông báo lỗi đều bằng tiếng Việt.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Đăng xuất khỏi hệ thống.
     * Xoá accessToken in-memory, reset state và gọi API logout (fire-and-forget).
     */
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
      state.error = null;
      clearAccessToken();
      // Gọi API logout để server xoá HttpOnly cookie (fire-and-forget)
      authService.logout().catch(() => {
        // Bỏ qua lỗi - việc xoá token in-memory đã đủ để đăng xuất phía client
      });
    },
    /**
     * Xoá thông báo lỗi.
     * Dùng khi người dùng bắt đầu thao tác mới.
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // -----------------------------------------------------------------------
    // loginUser
    // -----------------------------------------------------------------------
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error =
          (action.payload as string) ||
          'Đăng nhập thất bại. Vui lòng thử lại.';
      });

    // -----------------------------------------------------------------------
    // registerUser
    // -----------------------------------------------------------------------
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error =
          (action.payload as string) || 'Đăng ký thất bại. Vui lòng thử lại.';
      });

    // -----------------------------------------------------------------------
    // checkSession
    // -----------------------------------------------------------------------
    builder
      .addCase(checkSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(checkSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        // Không set error cho checkSession vì đây là kiểm tra tự động,
        // không phải hành động của người dùng
        state.error = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;
