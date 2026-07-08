import React, { useState, forwardRef } from 'react';

// ===== Props Interface =====
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

// ===== Component =====
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, type = 'text', className = '', id, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        <label
          htmlFor={inputId}
          className="text-label-md text-on-surface"
        >
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>

        {/* Input wrapper */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`
              w-full rounded-xl border bg-surface-container-lowest
              px-4 py-3 text-body-md text-on-surface
              placeholder:text-outline
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary
              ${isPassword ? 'pr-12' : ''}
              ${error
                ? 'border-error ring-1 ring-error/20 focus:ring-error/40 focus:border-error'
                : 'border-outline-variant hover:border-outline'
              }
              ${className}
            `.trim()}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...rest}
          />

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-container"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="flex items-center gap-1 text-label-sm text-error fade-in"
          >
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-label-sm text-on-surface-variant"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
