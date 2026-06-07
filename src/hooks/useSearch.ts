/**
 * @fileoverview Hook quản lý logic tìm kiếm sản phẩm.
 * Bao gồm: debounced search, lịch sử tìm kiếm, gợi ý danh mục.
 *
 * Lịch sử tìm kiếm được lưu vào localStorage (tối đa 8 mục).
 *
 * @example
 * const { query, setQuery, debouncedQuery, recentSearches, clearHistory } = useSearch();
 */

import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { getItem, setItem } from '../utils/storage';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'sl_recent_searches';
const MAX_RECENT = 8;

/** Gợi ý danh mục phổ biến (hiển thị khi chưa nhập gì) */
const POPULAR_SUGGESTIONS = [
  { label: 'Áo thun', icon: 'checkroom' },
  { label: 'Điện thoại', icon: 'smartphone' },
  { label: 'Bàn làm việc', icon: 'desk' },
  { label: 'Nồi cơm điện', icon: 'rice_bowl' },
  { label: 'Giày thể thao', icon: 'steps' },
  { label: 'Sách', icon: 'menu_book' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseSearchReturn {
  /** Giá trị query hiện tại (cập nhật real-time) */
  query: string;
  /** Cập nhật query */
  setQuery: (value: string) => void;
  /** Query đã debounce (trì hoãn 300ms) */
  debouncedQuery: string;
  /** Danh sách tìm kiếm gần đây */
  recentSearches: string[];
  /** Gợi ý phổ biến */
  popularSuggestions: typeof POPULAR_SUGGESTIONS;
  /** Lưu search query vào lịch sử */
  saveToHistory: (query: string) => void;
  /** Xoá một mục khỏi lịch sử */
  removeFromHistory: (query: string) => void;
  /** Xoá toàn bộ lịch sử */
  clearHistory: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    return getItem<string[]>(STORAGE_KEY) || [];
  });

  /** Lưu query vào lịch sử (đặt lên đầu, loại bỏ trùng lặp) */
  const saveToHistory = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
      setItem(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  /** Xoá một mục khỏi lịch sử */
  const removeFromHistory = useCallback((searchQuery: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter(
        (item) => item.toLowerCase() !== searchQuery.toLowerCase()
      );
      setItem(STORAGE_KEY, updated);
      return updated;
    });
  }, []);

  /** Xoá toàn bộ lịch sử */
  const clearHistory = useCallback(() => {
    setRecentSearches([]);
    setItem(STORAGE_KEY, []);
  }, []);

  return useMemo(
    () => ({
      query,
      setQuery,
      debouncedQuery,
      recentSearches,
      popularSuggestions: POPULAR_SUGGESTIONS,
      saveToHistory,
      removeFromHistory,
      clearHistory,
    }),
    [query, debouncedQuery, recentSearches, saveToHistory, removeFromHistory, clearHistory]
  );
}

export default useSearch;
