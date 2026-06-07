import React from 'react';

// ===== Props Interface =====
interface PricingStepProps {
  price: string;
  negotiable: boolean;
  condition: string;
  onPriceChange: (value: string) => void;
  onNegotiableChange: (value: boolean) => void;
  onConditionChange: (value: string) => void;
}

// ===== Condition options =====
const conditions = [
  {
    value: 'new',
    label: 'Mới 100%',
    description: 'Chưa qua sử dụng, còn nguyên tem/mác.',
    icon: 'fiber_new',
  },
  {
    value: 'like_new',
    label: 'Như mới',
    description: 'Đã sử dụng vài lần, không tì vết.',
    icon: 'star',
  },
  {
    value: 'good',
    label: 'Tốt',
    description: 'Có dấu hiệu sử dụng nhẹ, hoạt động tốt.',
    icon: 'thumb_up',
  },
  {
    value: 'fair',
    label: 'Khá',
    description: 'Có hao mòn rõ rệt nhưng vẫn dùng được.',
    icon: 'handyman',
  },
];

// ===== Component =====
const PricingStep: React.FC<PricingStepProps> = ({
  price,
  negotiable,
  condition,
  onPriceChange,
  onNegotiableChange,
  onConditionChange,
}) => {
  // Format price with thousand separators
  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    onPriceChange(raw);
  };

  const formattedPrice = price
    ? Number(price).toLocaleString('vi-VN')
    : '';

  return (
    <div className="space-y-7">
      {/* Section header */}
      <div>
        <h2 className="text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">sell</span>
          Định giá & Tình trạng
        </h2>
        <p className="mt-1.5 text-body-sm text-on-surface-variant">
          Đặt giá hợp lý và mô tả chính xác tình trạng để bán nhanh hơn.
        </p>
      </div>

      {/* ===== Price Input ===== */}
      <div className="space-y-1.5">
        <label className="text-label-md text-on-surface" htmlFor="price-input">
          Giá bán <span className="text-error">*</span>
        </label>
        <div className="relative">
          <input
            id="price-input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={formattedPrice}
            onChange={handlePriceInput}
            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-4 pr-16 py-4 text-headline-sm text-on-surface text-right font-semibold placeholder:text-outline placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary hover:border-outline transition-all duration-200"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-label-md text-on-surface-variant font-medium">
            VNĐ
          </span>
        </div>
      </div>

      {/* ===== Negotiable Checkbox ===== */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={negotiable}
            onChange={(e) => onNegotiableChange(e.target.checked)}
            className="peer sr-only"
          />
          <div className={`
            flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200
            ${negotiable
              ? 'border-primary bg-primary-container'
              : 'border-outline-variant group-hover:border-outline'
            }
          `}>
            {negotiable && (
              <span className="material-symbols-outlined text-[14px] text-on-primary-container fade-in">
                check
              </span>
            )}
          </div>
        </div>
        <span className="text-body-md text-on-surface group-hover:text-on-surface/80 transition-colors select-none">
          Có thể thương lượng
        </span>
      </label>

      {/* ===== Condition Grid ===== */}
      <div className="space-y-3">
        <label className="text-label-md text-on-surface">
          Tình trạng sản phẩm <span className="text-error">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {conditions.map((cond) => {
            const isSelected = condition === cond.value;
            return (
              <button
                key={cond.value}
                type="button"
                onClick={() => onConditionChange(isSelected ? '' : cond.value)}
                className={`
                  relative flex flex-col items-start rounded-xl border-2 p-4
                  text-left transition-all duration-200 ease-out cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim
                  ${isSelected
                    ? 'border-primary bg-primary-container/10 shadow-md'
                    : 'border-outline-variant/60 bg-surface-container-lowest hover:border-outline hover:shadow-sm'
                  }
                `}
              >
                {/* Check badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary fade-in">
                    <span className="material-symbols-outlined text-[12px]">check</span>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`
                    mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200
                    ${isSelected
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container text-on-surface-variant'
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-[20px]">{cond.icon}</span>
                </div>

                {/* Label */}
                <p className={`text-label-md font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                  {cond.label}
                </p>

                {/* Description */}
                <p className="text-label-sm text-on-surface-variant leading-relaxed">
                  {cond.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingStep;
