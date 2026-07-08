/**
 * @fileoverview Hàm định dạng ngày tháng theo locale tiếng Việt.
 *
 * Bao gồm:
 * - formatDate: Định dạng ngày tháng đầy đủ (ví dụ: '03 tháng 6, 2026')
 * - formatRelative: Định dạng thời gian tương đối (ví dụ: '5 phút trước')
 */

/**
 * Các mốc thời gian tính bằng mili giây, dùng cho formatRelative.
 */
const TIME_UNITS = {
  /** 1 phút = 60.000 ms */
  MINUTE: 60 * 1000,
  /** 1 giờ = 3.600.000 ms */
  HOUR: 60 * 60 * 1000,
  /** 1 ngày = 86.400.000 ms */
  DAY: 24 * 60 * 60 * 1000,
  /** 1 tuần = 604.800.000 ms */
  WEEK: 7 * 24 * 60 * 60 * 1000,
  /** 1 tháng ≈ 30 ngày = 2.592.000.000 ms */
  MONTH: 30 * 24 * 60 * 60 * 1000,
  /** 1 năm ≈ 365 ngày = 31.536.000.000 ms */
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Chuyển đổi input thành Date object.
 * Hỗ trợ cả chuỗi ISO 8601 và Date object.
 *
 * @param date - Chuỗi ngày tháng hoặc Date object
 * @returns Date object
 */
const toDate = (date: string | Date): Date => {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

/**
 * Định dạng ngày tháng theo locale tiếng Việt.
 * Sử dụng Intl.DateTimeFormat với locale 'vi-VN'.
 *
 * @param date - Chuỗi ISO 8601 hoặc Date object
 * @returns Chuỗi ngày tháng đã định dạng, ví dụ: '03 tháng 6, 2026'
 *
 * @example
 * formatDate('2026-06-03T14:30:00Z'); // '3 tháng 6, 2026'
 * formatDate(new Date());              // Ngày hiện tại theo locale Việt Nam
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = toDate(date);

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Định dạng thời gian tương đối so với hiện tại.
 * Trả về chuỗi tiếng Việt mô tả khoảng cách thời gian.
 *
 * Các mốc thời gian:
 * - Dưới 1 phút: 'Vừa xong'
 * - Dưới 1 giờ: 'X phút trước'
 * - Dưới 1 ngày: 'X giờ trước'
 * - Dưới 1 tuần: 'X ngày trước'
 * - Dưới 1 tháng: 'X tuần trước'
 * - Dưới 1 năm: 'X tháng trước'
 * - Trên 1 năm: 'X năm trước'
 *
 * @param date - Chuỗi ISO 8601 hoặc Date object
 * @returns Chuỗi thời gian tương đối bằng tiếng Việt
 *
 * @example
 * formatRelative(new Date(Date.now() - 30000));     // 'Vừa xong'
 * formatRelative(new Date(Date.now() - 300000));    // '5 phút trước'
 * formatRelative(new Date(Date.now() - 7200000));   // '2 giờ trước'
 * formatRelative(new Date(Date.now() - 172800000)); // '2 ngày trước'
 */
export const formatRelative = (date: string | Date): string => {
  const dateObj = toDate(date);
  const now = Date.now();
  const diff = now - dateObj.getTime();

  // Xử lý trường hợp thời gian trong tương lai
  if (diff < 0) {
    return 'Vừa xong';
  }

  if (diff < TIME_UNITS.MINUTE) {
    return 'Vừa xong';
  }

  if (diff < TIME_UNITS.HOUR) {
    const minutes = Math.floor(diff / TIME_UNITS.MINUTE);
    return `${minutes} phút trước`;
  }

  if (diff < TIME_UNITS.DAY) {
    const hours = Math.floor(diff / TIME_UNITS.HOUR);
    return `${hours} giờ trước`;
  }

  if (diff < TIME_UNITS.WEEK) {
    const days = Math.floor(diff / TIME_UNITS.DAY);
    return `${days} ngày trước`;
  }

  if (diff < TIME_UNITS.MONTH) {
    const weeks = Math.floor(diff / TIME_UNITS.WEEK);
    return `${weeks} tuần trước`;
  }

  if (diff < TIME_UNITS.YEAR) {
    const months = Math.floor(diff / TIME_UNITS.MONTH);
    return `${months} tháng trước`;
  }

  const years = Math.floor(diff / TIME_UNITS.YEAR);
  return `${years} năm trước`;
};
