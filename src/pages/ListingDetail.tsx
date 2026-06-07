import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchListingById, clearSelectedListing } from '../redux/slices/listingSlice';
import { startConversation } from '../redux/slices/messageSlice';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ImageGallery from '../components/ImageGallery';
import BookmarkButton from '../components/BookmarkButton';
import Button from '../components/Button';
import StarRating from '../components/StarRating';
import ReviewCard from '../features/review/ReviewCard';
import ReviewForm from '../features/review/ReviewForm';
import { formatVND } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import reviewService from '../services/reviewService';
import type { Review } from '../types/review.types';

// ===== Condition display map =====
const conditionMap: Record<string, { label: string; icon: string }> = {
  new: { label: 'Mới 100%', icon: 'fiber_new' },
  'like-new': { label: 'Như mới', icon: 'star' },
  good: { label: 'Tốt', icon: 'thumb_up' },
  fair: { label: 'Khá', icon: 'handyman' },
};

// ===== Category display map =====
const categoryMap: Record<string, string> = {
  fashion: 'Thời trang',
  electronics: 'Điện tử',
  furniture: 'Nội thất',
  household: 'Đồ gia dụng',
  other: 'Khác',
};

// ===== Component =====
const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const { selectedListing: listing, isDetailLoading, error } = useAppSelector(
    (state) => state.listing
  );

  // ===== Review state =====
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isContactingSeller, setIsContactingSeller] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchListingById(id));
    }
    return () => {
      dispatch(clearSelectedListing());
    };
  }, [id, dispatch]);

  // Fetch reviews when listing loads
  useEffect(() => {
    if (listing?.id) {
      setIsLoadingReviews(true);
      reviewService
        .getListingReviews(listing.id)
        .then(setReviews)
        .catch(() => {
          // Silently fail - reviews are not critical
          setReviews([]);
        })
        .finally(() => setIsLoadingReviews(false));
    }
  }, [listing?.id]);

  // ===== Handle "Nhắn tin người bán" =====
  const handleContactSeller = useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/dang-nhap', { state: { from: { pathname: `/san-pham/${id}` } } });
      return;
    }
    if (!listing?.seller?.id) return;
    if (listing.seller.id === user?.id) {
      showToast({ type: 'info', message: 'Bạn không thể nhắn tin cho chính mình.' });
      return;
    }

    setIsContactingSeller(true);
    try {
      const result = await dispatch(
        startConversation({
          recipientId: listing.seller.id,
          content: `Xin chào, tôi quan tâm đến sản phẩm "${listing.title}".`,
          listingId: listing.id,
        })
      );
      if (startConversation.fulfilled.match(result)) {
        navigate('/tin-nhan');
        showToast({ type: 'success', message: 'Đã bắt đầu cuộc trò chuyện!' });
      } else {
        showToast({ type: 'error', message: 'Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.' });
      }
    } catch {
      showToast({ type: 'error', message: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
    } finally {
      setIsContactingSeller(false);
    }
  }, [isAuthenticated, listing, user, dispatch, navigate, showToast, id]);

  // ===== Handle submit review =====
  const handleSubmitReview = useCallback(
    async (data: { rating: number; comment: string }) => {
      if (!listing?.seller?.id || !listing?.id) return;
      setIsSubmittingReview(true);
      try {
        const newReview = await reviewService.createReview({
          listingId: listing.id,
          sellerId: listing.seller.id,
          rating: data.rating,
          comment: data.comment,
        });
        setReviews((prev) => [newReview, ...prev]);
        showToast({ type: 'success', message: 'Đánh giá của bạn đã được gửi! 🎉' });
      } catch {
        showToast({ type: 'error', message: 'Gửi đánh giá thất bại. Vui lòng thử lại.' });
      } finally {
        setIsSubmittingReview(false);
      }
    },
    [listing, showToast]
  );

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // ===== Loading state =====
  if (isDetailLoading) {
    return (
      <div className="page-enter">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Image skeleton */}
            <div className="aspect-square skeleton rounded-2xl" />
            {/* Info skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-2/3 skeleton rounded" />
              <div className="h-10 w-1/2 skeleton rounded" />
              <div className="h-4 w-full skeleton rounded" />
              <div className="h-4 w-3/4 skeleton rounded" />
              <div className="h-4 w-5/6 skeleton rounded" />
              <div className="h-12 w-full skeleton rounded-xl mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== Error state =====
  if (error || !listing) {
    return (
      <div className="page-enter flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <span className="material-symbols-outlined text-[72px] text-outline/30 mb-4">
          search_off
        </span>
        <h2 className="text-headline-md text-on-surface mb-2">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-body-md text-on-surface-variant mb-8 max-w-md">
          {error || 'Sản phẩm này không tồn tại hoặc đã bị xoá.'}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" icon="arrow_back" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          <Button icon="storefront" onClick={() => navigate('/cua-hang')}>
            Đến cửa hàng
          </Button>
        </div>
      </div>
    );
  }

  const condInfo = conditionMap[listing.condition] || conditionMap.good;
  const isSeller = user?.id === listing.seller?.id;

  return (
    <div className="page-enter">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-6 md:py-10">
        {/* ===== Breadcrumb ===== */}
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link to="/cua-hang" className="hover:text-primary transition-colors">Cửa hàng</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface truncate max-w-[200px]">{listing.title}</span>
        </nav>

        {/* ===== Main Content Grid ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Image Gallery */}
          <div>
            <ImageGallery images={listing.images} alt={listing.title} />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            {/* Category badge */}
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">category</span>
                {categoryMap[listing.category] || listing.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-headline-md md:text-headline-lg text-on-surface leading-tight">
              {listing.title}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              <p className="text-headline-lg md:text-display-lg text-primary font-bold">
                {formatVND(listing.price)}
              </p>
              {listing.negotiable && (
                <span className="rounded-lg bg-primary-container/15 border border-primary/10 px-2.5 py-1 text-label-sm text-primary font-medium">
                  Thương lượng
                </span>
              )}
            </div>

            {/* Condition */}
            <div className="mt-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                {condInfo.icon}
              </span>
              <span className="text-body-md text-on-surface">
                Tình trạng: <strong>{condInfo.label}</strong>
              </span>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-outline-variant/30" />

            {/* Description */}
            <div>
              <h3 className="text-label-md text-on-surface font-semibold mb-2 uppercase tracking-wider">
                Mô tả sản phẩm
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-outline-variant/30" />

            {/* Seller info */}
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 p-5">
              <h3 className="text-label-md text-on-surface font-semibold mb-3 uppercase tracking-wider">
                Người bán
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-headline-sm font-bold">
                  {listing.seller?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-body-md text-on-surface font-medium truncate">
                    {listing.seller?.displayName || 'Người dùng'}
                  </p>
                  <p className="text-label-sm text-on-surface-variant">
                    Đăng ngày {formatDate(listing.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {!isSeller && (
                <Button
                  size="lg"
                  icon="chat"
                  className="flex-1"
                  onClick={handleContactSeller}
                  loading={isContactingSeller}
                >
                  Nhắn tin người bán
                </Button>
              )}
              <BookmarkButton listingId={listing.id} variant="button" />
            </div>

            {/* Post date */}
            <p className="mt-4 text-label-sm text-outline text-center sm:text-left">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                schedule
              </span>
              Đăng ngày {formatDate(listing.createdAt)}
            </p>
          </div>
        </div>

        {/* ===== Reviews Section ===== */}
        <div className="mt-12 md:mt-16">
          <div className="border-t border-outline-variant/30 pt-10">
            {/* Section header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-headline-sm md:text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[24px] text-primary">reviews</span>
                  Đánh giá sản phẩm
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-3 mt-2">
                    <StarRating rating={averageRating} size="sm" showValue />
                    <span className="text-body-sm text-on-surface-variant">
                      ({reviews.length} đánh giá)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Review Form (only for logged-in users who are not the seller) */}
            {isAuthenticated && !isSeller && (
              <div className="mb-8">
                <ReviewForm onSubmit={handleSubmitReview} isLoading={isSubmittingReview} />
              </div>
            )}

            {/* Not logged in prompt */}
            {!isAuthenticated && (
              <div className="mb-8 rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 p-6 text-center">
                <p className="text-body-sm text-on-surface-variant mb-3">
                  Đăng nhập để viết đánh giá sản phẩm này.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  icon="login"
                  onClick={() => navigate('/dang-nhap', { state: { from: { pathname: `/san-pham/${id}` } } })}
                >
                  Đăng nhập
                </Button>
              </div>
            )}

            {/* Review list */}
            {isLoadingReviews ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-outline-variant/20 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 skeleton rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-1/3 skeleton rounded" />
                        <div className="h-3 w-1/4 skeleton rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-1/2 skeleton rounded mb-2" />
                    <div className="h-3 w-3/4 skeleton rounded" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-[48px] text-outline/20 mb-3 block">
                  rate_review
                </span>
                <p className="text-body-md text-on-surface-variant">
                  Chưa có đánh giá nào cho sản phẩm này.
                </p>
                <p className="text-label-sm text-outline mt-1">
                  Hãy là người đầu tiên chia sẻ trải nghiệm!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
