import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchListings, setFilters, clearFilters } from '../redux/slices/listingSlice';
import type { ListingFilters } from '../redux/slices/listingSlice';
import type { ListingCategory, ListingCondition } from '../types/listing.types';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import Pagination from '../components/Pagination';
import Chip from '../components/Chip';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

// ===== Category options =====
const categories: { value: ListingCategory; label: string; icon: string }[] = [
  { value: 'fashion', label: 'Thời trang', icon: 'checkroom' },
  { value: 'electronics', label: 'Điện tử', icon: 'devices' },
  { value: 'furniture', label: 'Nội thất', icon: 'chair' },
  { value: 'household', label: 'Đồ gia dụng', icon: 'home' },
  { value: 'other', label: 'Khác', icon: 'more_horiz' },
];

// ===== Condition options =====
const conditions: { value: ListingCondition; label: string }[] = [
  { value: 'new', label: 'Mới 100%' },
  { value: 'like-new', label: 'Như mới' },
  { value: 'good', label: 'Tốt' },
  { value: 'fair', label: 'Khá' },
];

// ===== Sort options =====
const sortOptions: { value: ListingFilters['sort']; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
];

// ===== Component =====
const Shop: React.FC = () => {
  const dispatch = useAppDispatch();
  const { listings, isLoading, error, pagination, filters } = useAppSelector(
    (state) => state.listing
  );
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [filters]);

  // Fetch listings on mount
  useEffect(() => {
    dispatch(fetchListings());
  }, [dispatch]);

  // Client-side filtering & sorting (until backend supports query params)
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Filter by category
    if (filters.category) {
      result = result.filter((l) => l.category === filters.category);
    }

    // Filter by condition
    if (filters.condition) {
      result = result.filter((l) => l.condition === filters.condition);
    }

    // Filter by search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      result = result.filter((l) => l.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((l) => l.price <= filters.maxPrice!);
    }

    // Sort
    switch (filters.sort) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [listings, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / pagination.itemsPerPage);
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pagination.itemsPerPage;
    return filteredListings.slice(start, start + pagination.itemsPerPage);
  }, [filteredListings, currentPage, pagination.itemsPerPage]);

  const activeFilterCount = [
    filters.category,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="page-enter">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* ===== Page Header ===== */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-headline-md md:text-headline-lg text-on-surface">
              Cửa hàng
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Khám phá {filteredListings.length > 0 ? `${filteredListings.length} sản phẩm` : 'sản phẩm'} từ cộng đồng bền vững
            </p>
          </div>

          {/* Sort & Filter toggle */}
          <div className="flex items-center gap-3">
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={filters.sort || 'newest'}
                onChange={(e) =>
                  dispatch(setFilters({ sort: e.target.value as ListingFilters['sort'] }))
                }
                className="appearance-none rounded-xl border border-outline-variant bg-surface-container-lowest pl-4 pr-10 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary cursor-pointer transition-all duration-200"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
                unfold_more
              </span>
            </div>

            {/* Filter toggle button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex items-center gap-2 rounded-xl border px-4 py-2.5 text-body-sm font-medium
                transition-all duration-200 cursor-pointer
                ${
                  showFilters || activeFilterCount > 0
                    ? 'border-primary bg-primary-container/10 text-primary'
                    : 'border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
                }
              `}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary text-label-sm">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ===== Filter Panel ===== */}
        {showFilters && (
          <div className="mb-8 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-label-md text-on-surface font-semibold">Bộ lọc</h3>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="filter_alt_off"
                  onClick={() => dispatch(clearFilters())}
                >
                  Xoá bộ lọc
                </Button>
              )}
            </div>

            {/* Category filter */}
            <div className="mb-5">
              <p className="text-label-sm text-on-surface-variant mb-2.5 uppercase tracking-wider">
                Danh mục
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Chip
                    key={cat.value}
                    label={cat.label}
                    icon={cat.icon}
                    selected={filters.category === cat.value}
                    onClick={() =>
                      dispatch(
                        setFilters({
                          category: filters.category === cat.value ? undefined : cat.value,
                        })
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* Condition filter */}
            <div>
              <p className="text-label-sm text-on-surface-variant mb-2.5 uppercase tracking-wider">
                Tình trạng
              </p>
              <div className="flex flex-wrap gap-2">
                {conditions.map((cond) => (
                  <Chip
                    key={cond.value}
                    label={cond.label}
                    selected={filters.condition === cond.value}
                    onClick={() =>
                      dispatch(
                        setFilters({
                          condition: filters.condition === cond.value ? undefined : cond.value,
                        })
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== Content ===== */}
        {isLoading ? (
          /* Skeleton loading grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <ListingCardSkeleton count={8} />
          </div>
        ) : error ? (
          /* Error state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-[64px] text-error/40 mb-4">
              cloud_off
            </span>
            <h3 className="text-headline-sm text-on-surface mb-2">Đã xảy ra lỗi</h3>
            <p className="text-body-sm text-on-surface-variant mb-6 max-w-sm">{error}</p>
            <Button icon="refresh" onClick={() => dispatch(fetchListings())}>
              Thử lại
            </Button>
          </div>
        ) : paginatedListings.length === 0 ? (
          <EmptyState
            icon={activeFilterCount > 0 ? 'search_off' : 'inventory_2'}
            title={activeFilterCount > 0 ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
            description={
              activeFilterCount > 0
                ? 'Thử thay đổi bộ lọc để tìm sản phẩm phù hợp.'
                : 'Hãy là người đầu tiên đăng sản phẩm lên cửa hàng!'
            }
            actionLabel={activeFilterCount > 0 ? 'Xoá bộ lọc' : undefined}
            actionIcon={activeFilterCount > 0 ? 'filter_alt_off' : undefined}
            onAction={activeFilterCount > 0 ? () => dispatch(clearFilters()) : undefined}
          />
        ) : (
          <>
            {/* Product grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
