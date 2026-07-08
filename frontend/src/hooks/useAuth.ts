/**
 * @fileoverview Hook tuỳ chỉnh quản lý xác thực người dùng.
 * Đóng gói logic Redux để các component sử dụng đơn giản hơn.
 */

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
  loginUser,
  registerUser,
  logout as logoutAction,
  clearError,
} from '../redux/slices/authSlice';
import type { LoginPayload, RegisterPayload, User } from '../types/auth.types';
import { connectSocket, disconnectSocket } from '../services/socketService';

/** Kết quả trả về khi gọi hàm login hoặc register */
interface AuthActionResult {
  success: boolean;
  error?: string;
}

/** Giá trị trả về từ hook useAuth */
export interface UseAuthReturn {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginPayload) => Promise<AuthActionResult>;
  register: (data: RegisterPayload) => Promise<AuthActionResult>;
  logout: () => void;
  resetError: () => void;
}

/**
 * Hook quản lý toàn bộ logic xác thực.
 * Đóng gói Redux state và dispatch.
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = useCallback(
    async (data: LoginPayload): Promise<AuthActionResult> => {
      try {
        const resultAction = await dispatch(loginUser(data));
        if (loginUser.fulfilled.match(resultAction)) {
          // Kết nối Socket.IO sau khi đăng nhập thành công
          connectSocket();
          return { success: true };
        }
        return {
          success: false,
          error:
            (resultAction.payload as string) ||
            'Đăng nhập thất bại. Vui lòng thử lại.',
        };
      } catch {
        return {
          success: false,
          error: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
        };
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (data: RegisterPayload): Promise<AuthActionResult> => {
      try {
        const resultAction = await dispatch(registerUser(data));
        if (registerUser.fulfilled.match(resultAction)) {
          // Kết nối Socket.IO sau khi đăng ký thành công
          connectSocket();
          return { success: true };
        }
        return {
          success: false,
          error:
            (resultAction.payload as string) ||
            'Đăng ký thất bại. Vui lòng thử lại.',
        };
      } catch {
        return {
          success: false,
          error: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
        };
      }
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    disconnectSocket();
    dispatch(logoutAction());
  }, [dispatch]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    resetError,
  };
}

export default useAuth;
