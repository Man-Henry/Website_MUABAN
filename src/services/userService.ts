/**
 * @fileoverview Service xử lý các thao tác liên quan đến tài khoản người dùng.
 */

import type { User } from '../types/auth.types';
import api from './api';

/** Payload cập nhật thông tin cá nhân */
export interface UpdateProfilePayload {
  displayName?: string;
  phone?: string;
  bio?: string;
  location?: string;
}

/** Payload đổi mật khẩu */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * Lấy thông tin người dùng hiện tại.
 */
const getProfile = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

/**
 * Lấy thông tin công khai của một người dùng.
 */
const getPublicProfile = async (userId: string): Promise<User> => {
  const response = await api.get<User>(`/users/${userId}`);
  return response.data;
};

/**
 * Cập nhật thông tin cá nhân.
 */
const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  const response = await api.patch<User>('/users/me', payload);
  return response.data;
};

/**
 * Upload ảnh đại diện.
 */
const uploadAvatar = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post<{ url: string }>('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Đổi mật khẩu.
 */
const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await api.post('/users/me/password', payload);
};

const userService = {
  getProfile,
  getPublicProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
} as const;

export default userService;
