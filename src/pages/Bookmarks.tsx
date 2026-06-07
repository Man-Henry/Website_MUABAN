import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchListings } from '../redux/slices/listingSlice';
import { clearAllBookmarks } from '../redux/slices/bookmarkSlice';
import ListingCard from '../components/ListingCard';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

const Bookmarks: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { bookmarkedIds } = useAppSelector((state) => state.bookmark);
  const { listings, isLoading } = useAppSelector((state) => state.listing);

  // Fetch all listings (to filter by bookmarked IDs)
  useEffect(() => {
    if (listings.length === 0) {
      dispatch(fetchListings());
    }
  }, [dispatch, listings.length]);

  // Filter listings by bookmarked IDs
  const bookmarkedListings = listings.filter((l) => bookmarkedIds.includes(l.id));

  return (
    <div className="page-enter">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-headline-md md:text-headline-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined material-symbols-filled text-primary text-[28px]">
                bookmark
              </span>
              Tin đã lưu
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              {bookmarkedIds.length > 0
                ? `${bookmarkedIds.length} sản phẩm đã lưu`
                : 'Lưu sản phẩm yêu thích để xem lại sau'}
            </p>
          </div>

          {bookmarkedIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon="delete_sweep"
              onClick={() => dispatch(clearAllBookmarks())}
            >
              Xoá tất cả
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest overflow-hidden">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 skeleton rounded" />
                  <div className="h-6 w-1/2 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : bookmarkedListings.length === 0 ? (
          <EmptyState
            icon="bookmark_border"
            title="Chưa lưu sản phẩm nào"
            description="Nhấn biểu tượng bookmark trên sản phẩm để lưu lại xem sau."
            actionLabel="Khám phá cửa hàng"
            actionIcon="storefront"
            onAction={() => navigate('/cua-hang')}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bookmarkedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
