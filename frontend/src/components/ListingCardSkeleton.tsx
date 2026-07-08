import React from 'react';

// ===== Props Interface =====
interface ListingCardSkeletonProps {
  /** Số lượng skeleton cards */
  count?: number;
}

// ===== Single Skeleton Card =====
const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest overflow-hidden">
    {/* Image placeholder */}
    <div className="aspect-[4/3] skeleton" />

    {/* Content */}
    <div className="p-4 space-y-3">
      {/* Title lines */}
      <div className="space-y-2">
        <div className="h-4 w-4/5 skeleton rounded" />
        <div className="h-4 w-3/5 skeleton rounded" />
      </div>

      {/* Price */}
      <div className="h-6 w-2/5 skeleton rounded" />

      {/* Meta row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 skeleton rounded-full" />
          <div className="h-3 w-16 skeleton rounded" />
        </div>
        <div className="h-3 w-12 skeleton rounded" />
      </div>
    </div>
  </div>
);

// ===== Component =====
const ListingCardSkeleton: React.FC<ListingCardSkeletonProps> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
};

export default ListingCardSkeleton;
