import React from 'react';

// ===== Props Interface =====
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

// ===== Variant Styles Map =====
const variantStyles: Record<string, string> = {
  primary:
    'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary shadow-md hover:shadow-lg active:shadow-sm',
  secondary:
    'bg-surface-container text-on-surface hover:bg-surface-container-high active:bg-surface-container-highest',
  outline:
    'border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:border-primary hover:text-primary active:bg-surface-container',
  ghost:
    'text-on-surface-variant hover:bg-surface-container active:bg-surface-container-high',
};

// ===== Size Styles Map =====
const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-label-sm gap-1.5 rounded-lg',
  md: 'px-6 py-2.5 text-label-md gap-2 rounded-xl',
  lg: 'px-8 py-3.5 text-body-md font-semibold gap-2.5 rounded-xl',
};

const iconSizeMap: Record<string, string> = {
  sm: 'text-[16px]',
  md: 'text-[18px]',
  lg: 'text-[20px]',
};

// ===== Component =====
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        select-none cursor-pointer
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      {...rest}
    >
      {/* Loading spinner */}
      {loading && (
        <span className="material-symbols-outlined animate-spin text-[18px]">
          progress_activity
        </span>
      )}

      {/* Left icon */}
      {!loading && icon && iconPosition === 'left' && (
        <span className={`material-symbols-outlined ${iconSizeMap[size]}`}>
          {icon}
        </span>
      )}

      {/* Content */}
      <span>{children}</span>

      {/* Right icon */}
      {!loading && icon && iconPosition === 'right' && (
        <span className={`material-symbols-outlined ${iconSizeMap[size]}`}>
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;
