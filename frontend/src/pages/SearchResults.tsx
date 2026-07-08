import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchListings } from '../redux/slices/listingSlice';
import type { ListingCategory, ListingCondition } from '../types/listing.types';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import SearchBar from '../components/SearchBar';
import Chip from '../components/Chip';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

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
const sortOptions = [
  { value: 'relevant', label: 'Phù hợp nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
];

const ITEMS_PER_PAGE = 12;

// ===== Component =====
const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { listings, isLoading } = useAppSelector((state) => state.listing);

  const searchQuery = searchParams.get('q') || '';

  // Local filter state
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | ''>('');
  const [selectedCondition, setSelectedCondition] = useState<ListingCondition | ''>('');
  const [sortBy, setSortBy] = useState('relevant');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch listings on mount
  useEffect(() => {
    dispatch(fetchListings());
  }, [dispatch]);

  // Reset page when search/filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCondition, sortBy]);

  // Client-side filtering
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    let results = listings.filter(
      (l) =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query)
    );

    // Category filter
    if (selectedCategory) {
      results = results.filter((l) => l.category === selectedCategory);
    }

    // Condition filter
    if (selectedCondition) {
      results = results.filter((l) => l.condition === selectedCondition);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'relevant':
      default:
        // Ưu tiên kết quả khớp ở tiêu đề
        results.sort((a, b) => {
          const aInTitle = a.title.toLowerCase().includes(query) ? 1 : 0;
          const bInTitle = b.title.toLowerCase().includes(query) ? 1 : 0;
          if (aInTitle !== bInTitle) return bInTitle - aInTitle;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
    }

    return results;
  }, [listings, searchQuery, selectedCategory, selectedCondition, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResults.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredResults, currentPage]);

  const activeFilterCount = [selectedCategory, selectedCondition].filter(Boolean).length;

  return (
    <div className="page-enter">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* ===== Search Header ===== */}
        <div className="mb-8">
          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar variant="full" autoFocus />
          </div>

          {/* Query info */}
          {searchQuery && (
            <div className="text-center">
              <h1 className="text-headline-md text-on-surface">
                Kết quả cho{' '}
                <span className="text-primary">"{searchQuery}"</span>
              </h1>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                {isLoading
                  ? 'Đang tìm kiếm...'
                  : `Tìm thấy ${filteredResults.length} sản phẩm`}
              </p>
            </div>
          )}
        </div>

        {/* ===== Filters & Sort Bar ===== */}
        {searchQuery && (
          <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
            {/* Category chips */}
            <div className="flex flex-wrap gap-2 flex-1">
              {categories.map((cat) => (
                <Chip
                  key={cat.value}
                  label={cat.label}
                  icon={cat.icon}
                  selected={selectedCategory === cat.value}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.value ? '' : cat.value
                    )
                  }
                />
              ))}
            </div>

            {/* Sort */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
          </div>
        )}

        {/* Condition chips (secondary filter row) */}
        {searchQuery && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-label-sm text-on-surface-variant mr-1">Tình trạng:</span>
            {conditions.map((cond) => (
              <Chip
                key={cond.value}
                label={cond.label}
                selected={selectedCondition === cond.value}
                onClick={() =>
                  setSelectedCondition(
                    selectedCondition === cond.value ? '' : cond.value
                  )
                }
              />
            ))}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedCondition('');
                }}
                className="inline-flex items-center gap-1 text-label-sm text-primary hover:text-primary-container transition-colors cursor-pointer ml-2"
              >
                <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                Xoá lọc
              </button>
            )}
          </div>
        )}

        {/* ===== Results Content ===== */}
        {!searchQuery ? (
          /* No query entered */
          <EmptyState
            icon="search"
            title="Tìm kiếm sản phẩm"
            description="Nhập từ khoá để tìm kiếm sản phẩm từ cộng đồng bền vững."
          />
        ) : isLoading ? (
          /* Loading */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <ListingCardSkeleton count={8} />
          </div>
        ) : paginatedResults.length === 0 ? (
          /* No results */
          <EmptyState
            icon="search_off"
            title="Không tìm thấy kết quả"
            description={`Không có sản phẩm nào phù hợp với "${searchQuery}". Thử từ khoá khác hoặc điều chỉnh bộ lọc.`}
            actionLabel="Xem tất cả sản phẩm"
            actionIcon="storefront"
            onAction={() => navigate('/cua-hang')}
          />
        ) : (
          <>
            {/* Results grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedResults.map((listing) => (
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

export default SearchResults;
