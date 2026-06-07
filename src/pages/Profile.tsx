import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import userService from '../services/userService';
import Button from '../components/Button';
import Input from '../components/Input';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', message: 'Vui lòng chọn file hình ảnh.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', message: 'Ảnh không được vượt quá 5MB.' });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await userService.uploadAvatar(file);
      setAvatarUrl(result.url);
      showToast({ type: 'success', message: 'Cập nhật ảnh đại diện thành công!' });
    } catch {
      showToast({ type: 'error', message: 'Upload ảnh thất bại. Vui lòng thử lại.' });
    } finally {
      setIsUploadingAvatar(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      showToast({ type: 'error', message: 'Tên hiển thị không được để trống.' });
      return;
    }
    setIsSaving(true);
    try {
      await userService.updateProfile({ displayName: displayName.trim() });
      showToast({ type: 'success', message: 'Cập nhật thông tin thành công!' });
      setIsEditing(false);
    } catch {
      showToast({ type: 'error', message: 'Cập nhật thất bại. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      showToast({ type: 'error', message: 'Vui lòng nhập mật khẩu hiện tại.' });
      return;
    }
    if (newPassword.length < 6) {
      showToast({ type: 'error', message: 'Mật khẩu mới cần ít nhất 6 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    setIsSaving(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      });
      showToast({ type: 'success', message: 'Đổi mật khẩu thành công!' });
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showToast({ type: 'error', message: 'Đổi mật khẩu thất bại. Mật khẩu hiện tại có thể không đúng.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <h1 className="text-headline-md md:text-headline-lg text-on-surface mb-8">
          Tài khoản
        </h1>

        {/* ===== Profile Section ===== */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 md:p-8 mb-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.displayName || 'Avatar'}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-headline-lg font-bold">
                  {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-on-surface/40 text-surface-container-lowest opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
                aria-label="Đổi ảnh đại diện"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {isUploadingAvatar ? 'hourglass_top' : 'photo_camera'}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-headline-sm text-on-surface font-semibold">
                {user?.displayName || 'Người dùng'}
              </h2>
              <p className="text-body-sm text-on-surface-variant">{email}</p>
            </div>
          </div>

          {/* Edit form */}
          <div className="space-y-5">
            <Input
              label="Tên hiển thị"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={!isEditing}
              icon="badge"
            />
            <Input
              label="Email"
              value={email}
              disabled
              icon="mail"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {isEditing ? (
              <>
                <Button icon="save" onClick={handleSaveProfile} loading={isSaving}>
                  Lưu thay đổi
                </Button>
                <Button variant="ghost" onClick={() => { setIsEditing(false); setDisplayName(user?.displayName || ''); }}>
                  Huỷ
                </Button>
              </>
            ) : (
              <Button variant="outline" icon="edit" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>

        {/* ===== Password Section ===== */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-label-md text-on-surface font-semibold">Bảo mật</h3>
              <p className="text-label-sm text-on-surface-variant mt-0.5">Quản lý mật khẩu tài khoản</p>
            </div>
            {!showPasswordForm && (
              <Button variant="outline" size="sm" icon="lock" onClick={() => setShowPasswordForm(true)}>
                Đổi mật khẩu
              </Button>
            )}
          </div>

          {showPasswordForm && (
            <div className="space-y-4 pt-2 fade-in">
              <Input
                label="Mật khẩu hiện tại"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                icon="lock"
              />
              <Input
                label="Mật khẩu mới"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon="lock_reset"
              />
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon="lock_reset"
              />
              <div className="flex gap-3 pt-2">
                <Button icon="check" onClick={handleChangePassword} loading={isSaving}>
                  Xác nhận
                </Button>
                <Button variant="ghost" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}>
                  Huỷ
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ===== Danger Zone ===== */}
        <div className="rounded-2xl border border-error/20 bg-error-container/5 p-6 md:p-8">
          <h3 className="text-label-md text-error font-semibold mb-2">Vùng nguy hiểm</h3>
          <p className="text-label-sm text-on-surface-variant mb-4">
            Xoá tài khoản sẽ xoá vĩnh viễn tất cả dữ liệu, tin đăng và lịch sử nhắn tin.
          </p>
          <Button variant="ghost" size="sm" className="!text-error hover:!bg-error-container/30">
            Xoá tài khoản
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

