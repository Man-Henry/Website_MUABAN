import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchListings, removeListing } from '../redux/slices/listingSlice';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { formatVND } from '../utils/formatCurrency';
import { formatRelative } from '../utils/formatDate';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

// Tab options
type TabValue = 'active' | 'sold' | 'all';
const tabs: { value: TabValue; label: string; icon: string }[] = [
  { value: 'all', label: 'Tất cả', icon: 'list' },
  { value: 'active', label: 'Đang bán', icon: 'storefront' },
  { value: 'sold', label: 'Đã bán', icon: 'check_circle' },
];

const MyListings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { listings, isLoading } = useAppSelector((state) => state.listing);
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  useEffect(() => {
    dispatch(fetchListings());
  }, [dispatch]);

  // Filter by current user
  const myListings = listings.filter((l) => l.seller?.id === user?.id);

  // Tab filtering (client-side — in real app, status field would exist)
  const filteredListings = myListings; // All for now since no status field

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá tin này?')) return;
    const result = await dispatch(removeListing(id));
    if (removeListing.fulfilled.match(result)) {
      showToast({ type: 'success', message: 'Xoá tin thành công.' });
    } else {
      showToast({ type: 'error', message: 'Xoá tin thất bại. Vui lòng thử lại.' });
    }
  };

  return (
    <div className="page-enter">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-headline-md md:text-headline-lg text-on-surface">
              Tin đã đăng
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Quản lý {myListings.length} tin đăng của bạn
            </p>
          </div>
          <Link to="/dang-tin">
            <Button icon="add" size="sm">Đăng tin mới</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-xl bg-surface-container p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-label-sm font-medium
                transition-all duration-200 cursor-pointer
                ${
                  activeTab === tab.value
                    ? 'bg-surface-container-lowest shadow-sm text-on-surface'
                    : 'text-on-surface-variant hover:text-on-surface'
                }
              `}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-outline-variant/20 p-4 flex gap-4">
                <div className="h-24 w-24 skeleton rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 skeleton rounded" />
                  <div className="h-5 w-1/3 skeleton rounded" />
                  <div className="h-3 w-1/4 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <EmptyState
            icon="inventory_2"
            title="Chưa có tin đăng nào"
            description="Bắt đầu đăng sản phẩm đầu tiên của bạn lên cửa hàng."
            actionLabel="Đăng tin ngay"
            actionIcon="add"
            onAction={() => window.location.href = '/dang-tin'}
          />
        ) : (
          <div className="space-y-3">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 flex gap-4 hover:shadow-md transition-shadow duration-200"
              >
                {/* Thumbnail */}
                <Link to={`/san-pham/${listing.id}`} className="shrink-0">
                  <div className="h-24 w-24 rounded-xl overflow-hidden bg-surface-container">
                    {listing.images?.[0]?.url ? (
                      <img
                        src={listing.images[0].url}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px] text-outline/40">image</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/san-pham/${listing.id}`}>
                    <h3 className="text-body-md text-on-surface font-medium line-clamp-1 hover:text-primary transition-colors">
                      {listing.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-headline-sm text-primary font-bold">
                    {formatVND(listing.price)}
                  </p>
                  <p className="mt-1 text-label-sm text-outline">
                    {formatRelative(listing.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Link to={`/san-pham/${listing.id}`}>
                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer" aria-label="Xem">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(listing.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-error/70 hover:bg-error-container/30 hover:text-error transition-colors cursor-pointer"
                    aria-label="Xoá"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
