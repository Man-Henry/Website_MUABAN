import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { toggleBookmark } from '../redux/slices/bookmarkSlice';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

interface BookmarkButtonProps {
  listingId: string;
  /** Kiểu hiển thị */
  variant?: 'icon' | 'button';
  /** CSS class bổ sung */
  className?: string;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  listingId,
  variant = 'icon',
  className = '',
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const isBookmarked = useAppSelector((state) =>
    state.bookmark.bookmarkedIds.includes(listingId)
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast({
        type: 'info',
        message: 'Vui lòng đăng nhập để lưu tin.',
      });
      navigate('/dang-nhap');
      return;
    }

    dispatch(toggleBookmark(listingId));
    showToast({
      type: isBookmarked ? 'info' : 'success',
      message: isBookmarked ? 'Đã bỏ lưu tin.' : 'Đã lưu tin thành công!',
      duration: 2000,
    });
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`
          inline-flex items-center gap-2 rounded-xl border px-4 py-2.5
          text-body-sm font-medium transition-all duration-200 cursor-pointer
          ${
            isBookmarked
              ? 'border-primary bg-primary-container/10 text-primary'
              : 'border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
          }
          ${className}
        `}
      >
        <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'material-symbols-filled' : ''}`}>
          bookmark
        </span>
        {isBookmarked ? 'Đã lưu' : 'Lưu tin'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`
        flex h-9 w-9 items-center justify-center rounded-full
        transition-all duration-200 cursor-pointer
        ${
          isBookmarked
            ? 'bg-primary-container/20 text-primary'
            : 'bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface-variant hover:text-primary hover:bg-primary-container/10'
        }
        ${className}
      `}
      aria-label={isBookmarked ? 'Bỏ lưu' : 'Lưu tin'}
    >
      <span className={`material-symbols-outlined text-[20px] ${isBookmarked ? 'material-symbols-filled' : ''}`}>
        bookmark
      </span>
    </button>
  );
};

export default BookmarkButton;
