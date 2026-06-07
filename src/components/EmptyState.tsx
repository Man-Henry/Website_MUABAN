import React from 'react';
import Button from './Button';

// ===== Props Interface =====
interface EmptyStateProps {
  /** Material icon name */
  icon: string;
  /** Tiêu đề */
  title: string;
  /** Mô tả chi tiết */
  description?: string;
  /** Nội dung nút hành động */
  actionLabel?: string;
  /** Icon cho nút hành động */
  actionIcon?: string;
  /** Callback khi nhấn nút */
  onAction?: () => void;
}

// ===== Component =====
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center px-4">
      {/* Icon with background */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-primary-container/10" />
        </div>
        <span className="relative material-symbols-outlined text-[64px] text-outline/40">
          {icon}
        </span>
      </div>

      {/* Text */}
      <h3 className="text-headline-sm text-on-surface mb-2">{title}</h3>
      {description && (
        <p className="text-body-sm text-on-surface-variant max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* Action */}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="outline" icon={actionIcon} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
