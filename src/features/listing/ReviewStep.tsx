import React from 'react';
import type { ListingFormData } from '../../types';
import { formatVND } from '../../utils/formatCurrency';

// ===== Props Interface =====
interface ReviewStepProps {
  formData: ListingFormData;
}

// ===== Category labels =====
const categoryLabels: Record<string, string> = {
  fashion: 'Thời trang',
  electronics: 'Điện tử',
  furniture: 'Nội thất',
  household: 'Đồ gia dụng',
  other: 'Khác',
};

// ===== Condition labels =====
const conditionLabels: Record<string, string> = {
  new: 'Mới 100%',
  like_new: 'Như mới',
  'like-new': 'Như mới',
  good: 'Tốt',
  fair: 'Khá',
};

// ===== Component =====
const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const price = formData.price ? Number(formData.price) : 0;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">fact_check</span>
          Xem lại tin đăng
        </h2>
        <p className="mt-1.5 text-body-sm text-on-surface-variant">
          Kiểm tra lại thông tin trước khi đăng tin.
        </p>
      </div>

      {/* Image previews */}
      <div className="space-y-2">
        <h3 className="text-label-md text-on-surface font-semibold uppercase tracking-wider">
          Hình ảnh ({formData.previews.length})
        </h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {formData.previews.map((preview, index) => (
            <div
              key={preview.id}
              className="shrink-0 h-20 w-20 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container"
            >
              <img
                src={preview.url}
                alt={`Ảnh ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Info grid */}
      <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low/30 divide-y divide-outline-variant/20">
        {/* Product name */}
        <div className="flex items-start gap-4 px-5 py-4">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mt-0.5">label</span>
          <div className="min-w-0">
            <p className="text-label-sm text-on-surface-variant">Tên sản phẩm</p>
            <p className="text-body-md text-on-surface font-medium mt-0.5">{formData.name || '—'}</p>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-start gap-4 px-5 py-4">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mt-0.5">category</span>
          <div className="min-w-0">
            <p className="text-label-sm text-on-surface-variant">Danh mục</p>
            <p className="text-body-md text-on-surface font-medium mt-0.5">
              {categoryLabels[formData.category] || '—'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="flex items-start gap-4 px-5 py-4">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mt-0.5">description</span>
          <div className="min-w-0 flex-1">
            <p className="text-label-sm text-on-surface-variant">Mô tả</p>
            <p className="text-body-sm text-on-surface mt-0.5 leading-relaxed whitespace-pre-wrap">
              {formData.description || '—'}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-start gap-4 px-5 py-4">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mt-0.5">sell</span>
          <div className="min-w-0">
            <p className="text-label-sm text-on-surface-variant">Giá bán</p>
            <p className="text-headline-sm text-primary font-bold mt-0.5">
              {price > 0 ? formatVND(price) : '—'}
            </p>
            {formData.negotiable && (
              <span className="inline-block mt-1 rounded-md bg-primary-container/15 px-2 py-0.5 text-label-sm text-primary">
                Có thể thương lượng
              </span>
            )}
          </div>
        </div>

        {/* Condition */}
        <div className="flex items-start gap-4 px-5 py-4">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant mt-0.5">grade</span>
          <div className="min-w-0">
            <p className="text-label-sm text-on-surface-variant">Tình trạng</p>
            <p className="text-body-md text-on-surface font-medium mt-0.5">
              {conditionLabels[formData.condition] || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation note */}
      <div className="flex items-start gap-2 rounded-xl bg-primary-container/10 border border-primary/10 px-4 py-3">
        <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">tips_and_updates</span>
        <p className="text-label-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">Lưu ý:</span>{' '}
          Nhấn "Đăng tin ngay" để tin của bạn được hiển thị trên cửa hàng. Bạn có thể chỉnh sửa hoặc xoá tin sau khi đăng.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;
