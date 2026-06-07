/**
 * @fileoverview Hook debounce giá trị đầu vào.
 * Trì hoãn cập nhật giá trị cho đến khi người dùng ngừng thay đổi
 * trong khoảng thời gian chỉ định.
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 300);
 * // debouncedQuery chỉ cập nhật sau 300ms kể từ lần gõ cuối
 */

import { useEffect, useState } from 'react';

/**
 * Hook trì hoãn giá trị.
 *
 * @typeParam T - Kiểu giá trị cần debounce
 * @param value - Giá trị gốc (thay đổi liên tục)
 * @param delay - Thời gian trì hoãn (ms), mặc định 300ms
 * @returns Giá trị đã debounce
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
