import React, { useState } from 'react';
import StarRating from '../../components/StarRating';
import Button from '../../components/Button';

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string }) => void;
  isLoading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, isLoading = false }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Vui lòng chọn số sao.');
      return;
    }
    if (comment.trim().length < 5) {
      setError('Nhận xét cần ít nhất 5 ký tự.');
      return;
    }
    setError(null);
    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6">
      <h3 className="text-label-md text-on-surface font-semibold mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px] text-primary">rate_review</span>
        Viết đánh giá
      </h3>

      {/* Star selection */}
      <div className="mb-4">
        <p className="text-label-sm text-on-surface-variant mb-2">Đánh giá của bạn</p>
        <StarRating rating={rating} interactive onChange={setRating} size="lg" />
      </div>

      {/* Comment textarea */}
      <div className="mb-4">
        <label htmlFor="review-comment" className="text-label-sm text-on-surface-variant mb-2 block">
          Nhận xét
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setError(null);
          }}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          rows={3}
          className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary resize-none transition-all duration-200"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mb-3 text-label-sm text-error flex items-center gap-1.5 fade-in">
          <span className="material-symbols-outlined text-[14px]">warning</span>
          {error}
        </p>
      )}

      {/* Submit */}
      <Button icon="send" onClick={handleSubmit} loading={isLoading}>
        Gửi đánh giá
      </Button>
    </div>
  );
};

export default ReviewForm;
