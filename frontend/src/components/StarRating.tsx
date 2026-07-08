import React from 'react';

interface StarRatingProps {
  /** Điểm đánh giá hiện tại (0-5) */
  rating: number;
  /** Cho phép chỉnh sửa */
  interactive?: boolean;
  /** Callback khi chọn sao (chỉ dùng khi interactive=true) */
  onChange?: (rating: number) => void;
  /** Kích thước icon */
  size?: 'sm' | 'md' | 'lg';
  /** Hiển thị số điểm bên cạnh */
  showValue?: boolean;
}

const sizeMap = {
  sm: 'text-[16px]',
  md: 'text-[20px]',
  lg: 'text-[28px]',
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  onChange,
  size = 'md',
  showValue = false,
}) => {
  const iconSize = sizeMap[size];

  const handleClick = (star: number) => {
    if (interactive && onChange) {
      onChange(star);
    }
  };

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(rating);
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            disabled={!interactive}
            className={`
              ${iconSize} leading-none transition-all duration-150
              ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              ${isFilled ? 'text-amber-400' : 'text-outline/30'}
            `}
            aria-label={`${star} sao`}
          >
            <span className={`material-symbols-outlined ${iconSize} ${isFilled ? 'material-symbols-filled' : ''}`}>
              star
            </span>
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1.5 text-body-sm text-on-surface-variant font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
