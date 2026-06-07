import React from 'react';
import type { Review } from '../../types/review.types';
import StarRating from '../../components/StarRating';
import { formatRelative } from '../../utils/formatDate';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5">
      {/* Header: avatar + name + date */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container text-label-md font-bold">
          {review.reviewer?.displayName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm text-on-surface font-medium truncate">
            {review.reviewer?.displayName || 'Người dùng'}
          </p>
          <p className="text-label-sm text-outline">{formatRelative(review.createdAt)}</p>
        </div>
      </div>

      {/* Stars */}
      <div className="mb-2.5">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Comment */}
      <p className="text-body-sm text-on-surface-variant leading-relaxed">
        {review.comment}
      </p>
    </div>
  );
};

export default ReviewCard;
