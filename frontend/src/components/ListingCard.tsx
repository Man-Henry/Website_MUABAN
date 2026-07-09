import React from 'react';
import { Link } from 'react-router-dom';
import type { Listing } from '../types/listing.types';
import { formatVND } from '../utils/formatCurrency';
import { formatRelative } from '../utils/formatDate';
import BookmarkButton from './BookmarkButton';

// ===== Props Interface =====
interface ListingCardProps {
  listing: Listing;
}

// ===== Condition Labels =====
const conditionLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'Mới 100%', color: 'bg-primary-container/20 text-primary' },
  'like-new': { label: 'Như mới', color: 'bg-secondary-container/20 text-secondary' },
  good: { label: 'Tốt', color: 'bg-surface-container text-on-surface-variant' },
  fair: { label: 'Khá', color: 'bg-tertiary-fixed/20 text-tertiary' },
};

// ===== Component =====
const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const conditionInfo = conditionLabels[listing.condition] || conditionLabels.good;
  const coverImage = listing.images?.[0]?.url;
  const isSold = listing.status === 'sold';

  return (
    <Link
      to={`/san-pham/${listing.id}`}
      className={`group block rounded-2xl border bg-surface-container-lowest overflow-hidden transition-all duration-300 ease-out ${
        isSold
          ? 'border-outline-variant/10 opacity-80 hover:opacity-100 hover:shadow-lg'
          : 'border-outline-variant/20 hover:shadow-xl hover:-translate-y-2'
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
        {coverImage ? (
          <img
            src={coverImage}
            alt={listing.title}
            className={`h-full w-full object-cover transition-transform duration-500 ease-out ${
              isSold ? 'grayscale-[40%]' : 'group-hover:scale-105'
            }`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-outline/40">
              image
            </span>
          </div>
        )}

        {/* Condition badge */}
        <div className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-label-sm font-medium backdrop-blur-sm ${conditionInfo.color}`}>
          {conditionInfo.label}
        </div>

        {/* Bookmark button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <BookmarkButton listingId={listing.id} />
        </div>

        {/* Sold overlay */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className="flex items-center gap-1.5 rounded-xl bg-surface/90 px-4 py-2 shadow-lg border border-outline-variant/20">
              <span className="material-symbols-outlined text-[20px] text-primary">check_circle</span>
              <span className="text-label-md font-bold text-on-surface">Đã bán</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className={`text-body-md font-medium line-clamp-2 transition-colors duration-200 min-h-[3rem] ${
          isSold ? 'text-on-surface-variant' : 'text-on-surface group-hover:text-primary'
        }`}>
          {listing.title}
        </h3>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <p className={`text-headline-sm font-bold ${
            isSold ? 'text-on-surface-variant line-through' : 'text-primary'
          }`}>
            {formatVND(listing.price)}
          </p>
          {isSold && (
            <span className="rounded-md bg-surface-variant px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant border border-outline/10">
              Đã bán
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="mt-3 flex items-center justify-between">
          {/* Seller */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-container/30 text-on-primary-container text-label-sm font-bold">
              {listing.seller?.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-label-sm text-on-surface-variant truncate">
              {listing.seller?.displayName || 'Ẩn danh'}
            </span>
          </div>

          {/* Time */}
          <span className="text-label-sm text-outline shrink-0">
            {formatRelative(listing.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
