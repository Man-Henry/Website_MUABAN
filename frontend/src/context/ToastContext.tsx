/**
 * @fileoverview Hệ thống thông báo Toast toàn ứng dụng.
 * Sử dụng React Context để quản lý trạng thái toast từ bất kỳ component nào.
 *
 * @example
 * // Trong component
 * const { showToast } = useToast();
 * showToast({ type: 'success', message: 'Đăng tin thành công!' });
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ShowToastOptions {
  type: ToastType;
  message: string;
  /** Thời gian hiển thị (ms). Mặc định: 4000ms */
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (options: ShowToastOptions) => void;
  removeToast: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (options: ShowToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = options.duration ?? 4000;

      const toast: Toast = {
        id,
        type: options.type,
        message: options.message,
        duration,
      };

      setToasts((prev) => [...prev, toast]);

      // Tự động xoá sau duration
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
}

// ---------------------------------------------------------------------------
// Toast Container & Item Components
// ---------------------------------------------------------------------------

const toastConfig: Record<ToastType, { icon: string; bg: string; border: string; text: string }> = {
  success: {
    icon: 'check_circle',
    bg: 'bg-primary-container/15',
    border: 'border-primary/30',
    text: 'text-primary',
  },
  error: {
    icon: 'error',
    bg: 'bg-error-container/30',
    border: 'border-error/30',
    text: 'text-error',
  },
  warning: {
    icon: 'warning',
    bg: 'bg-tertiary-fixed/30',
    border: 'border-tertiary/30',
    text: 'text-tertiary',
  },
  info: {
    icon: 'info',
    bg: 'bg-surface-container',
    border: 'border-outline-variant/40',
    text: 'text-on-surface',
  },
};

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  const config = toastConfig[toast.type];

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 rounded-xl border
        ${config.bg} ${config.border}
        px-4 py-3.5 shadow-lg backdrop-blur-sm
        animate-toast-in
      `}
      role="alert"
    >
      <span className={`material-symbols-outlined text-[20px] mt-0.5 ${config.text} shrink-0`}>
        {config.icon}
      </span>
      <p className="text-body-sm text-on-surface flex-1 leading-relaxed">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
        aria-label="Đóng"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};

export default ToastProvider;
