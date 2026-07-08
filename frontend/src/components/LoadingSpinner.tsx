import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-surface">
      {/* Spinner container */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute h-20 w-20 animate-ping rounded-full bg-primary-container/20" />

        {/* Spinning ring */}
        <div className="absolute h-16 w-16 rounded-full border-[3px] border-surface-container-high border-t-primary spin-slow" />

        {/* Center icon */}
        <span className="material-symbols-outlined text-primary text-[32px] spin-slow">
          eco
        </span>
      </div>

      {/* Loading text */}
      <p className="mt-8 text-body-md text-on-surface-variant tracking-wide">
        Đang tải...
      </p>

      {/* Subtle dots animation */}
      <div className="mt-3 flex items-center gap-1.5">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-primary-container animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-primary-container animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-primary-container animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;
