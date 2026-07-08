import React from 'react';
import Input from '../../components/Input';
import Chip from '../../components/Chip';

// ===== Props Interface =====
interface InfoStepProps {
  name: string;
  category: string;
  description: string;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

// ===== Category options =====
const categories = [
  { value: 'fashion', label: 'Thời trang', icon: 'checkroom' },
  { value: 'electronics', label: 'Điện tử', icon: 'devices' },
  { value: 'furniture', label: 'Nội thất', icon: 'chair' },
  { value: 'household', label: 'Đồ gia dụng', icon: 'home' },
  { value: 'other', label: 'Khác', icon: 'more_horiz' },
];

const MAX_DESCRIPTION = 500;

// ===== Component =====
const InfoStep: React.FC<InfoStepProps> = ({
  name,
  category,
  description,
  onNameChange,
  onCategoryChange,
  onDescriptionChange,
}) => {
  const descriptionLength = description.length;
  const isOverLimit = descriptionLength > MAX_DESCRIPTION;

  return (
    <div className="space-y-7">
      {/* Section header */}
      <div>
        <h2 className="text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">info</span>
          Thông tin cơ bản
        </h2>
        <p className="mt-1.5 text-body-sm text-on-surface-variant">
          Mô tả chi tiết giúp người mua hiểu rõ hơn về sản phẩm của bạn.
        </p>
      </div>

      {/* Product name */}
      <Input
        label="Tên sản phẩm"
        placeholder="Ví dụ: Áo khoác jean vintage"
        required
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />

      {/* Category selection */}
      <div className="space-y-3">
        <label className="text-label-md text-on-surface">
          Danh mục <span className="text-error">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Chip
              key={cat.value}
              label={cat.label}
              icon={cat.icon}
              selected={category === cat.value}
              onClick={() => onCategoryChange(category === cat.value ? '' : cat.value)}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-label-md text-on-surface" htmlFor="listing-description">
          Mô tả sản phẩm
        </label>
        <div className="relative">
          <textarea
            id="listing-description"
            rows={5}
            placeholder="Mô tả tình trạng, kích thước, chất liệu, lý do bán..."
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= MAX_DESCRIPTION) {
                onDescriptionChange(e.target.value);
              }
            }}
            className={`
              w-full rounded-xl border bg-surface-container-lowest
              px-4 py-3 text-body-md text-on-surface
              placeholder:text-outline resize-none
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary
              ${isOverLimit
                ? 'border-error focus:ring-error/40 focus:border-error'
                : 'border-outline-variant hover:border-outline'
              }
            `}
          />
        </div>
        <div className="flex items-center justify-end">
          <span
            className={`text-label-sm ${
              isOverLimit ? 'text-error' : descriptionLength > MAX_DESCRIPTION * 0.8 ? 'text-tertiary' : 'text-on-surface-variant'
            }`}
          >
            {descriptionLength}/{MAX_DESCRIPTION}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InfoStep;
