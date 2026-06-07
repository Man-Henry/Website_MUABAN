import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';

// ===== Props Interface =====
interface SearchBarProps {
  /** Kích thước: compact cho header, full cho trang tìm kiếm */
  variant?: 'compact' | 'full';
  /** Tự động focus khi mount */
  autoFocus?: boolean;
  /** Callback khi đóng (dùng cho mobile) */
  onClose?: () => void;
  /** CSS class bổ sung */
  className?: string;
}

// ===== Component =====
const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'compact',
  autoFocus = false,
  onClose,
  className = '',
}) => {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    recentSearches,
    popularSuggestions,
    saveToHistory,
    removeFromHistory,
    clearHistory,
  } = useSearch();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  /** Submit search */
  const handleSubmit = useCallback(
    (searchQuery?: string) => {
      const q = (searchQuery || query).trim();
      if (!q) return;
      saveToHistory(q);
      setIsOpen(false);
      setQuery('');
      onClose?.();
      navigate(`/tim-kiem?q=${encodeURIComponent(q)}`);
    },
    [query, saveToHistory, navigate, onClose, setQuery]
  );

  /** Handle key events */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  /** Select a suggestion */
  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    handleSubmit(text);
  };

  const isCompact = variant === 'compact';
  const showDropdown = isOpen && (recentSearches.length > 0 || query.trim() === '');

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm sản phẩm..."
          className={`
            w-full rounded-xl border border-outline-variant bg-surface-container-low
            text-on-surface placeholder:text-outline
            focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary
            transition-all duration-200
            ${isCompact ? 'pl-10 pr-4 py-2 text-body-sm' : 'pl-10 pr-12 py-3 text-body-md'}
          `}
          aria-label="Tìm kiếm sản phẩm"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        />

        {/* Clear / Submit button */}
        {query && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Xoá"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
            {!isCompact && (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-primary hover:bg-primary-container/20 transition-colors cursor-pointer"
                aria-label="Tìm kiếm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ===== Dropdown ===== */}
      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-xl z-50 overflow-hidden fade-in"
          role="listbox"
        >
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="py-2">
              <div className="flex items-center justify-between px-4 py-1.5">
                <span className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">
                  Tìm kiếm gần đây
                </span>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-label-sm text-primary hover:text-primary-container transition-colors cursor-pointer"
                >
                  Xoá tất cả
                </button>
              </div>
              {recentSearches.map((search) => (
                <div
                  key={search}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container transition-colors cursor-pointer group"
                  role="option"
                  onClick={() => handleSelectSuggestion(search)}
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">
                    history
                  </span>
                  <span className="flex-1 text-body-sm text-on-surface truncate">{search}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(search);
                    }}
                    className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
                    aria-label={`Xoá "${search}" khỏi lịch sử`}
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Popular suggestions (when no query) */}
          {query.trim() === '' && (
            <div className={`py-2 ${recentSearches.length > 0 ? 'border-t border-outline-variant/20' : ''}`}>
              <div className="px-4 py-1.5">
                <span className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">
                  Gợi ý phổ biến
                </span>
              </div>
              <div className="flex flex-wrap gap-2 px-4 py-2">
                {popularSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion.label)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 text-label-sm text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary-container/10 transition-all duration-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">{suggestion.icon}</span>
                    {suggestion.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
