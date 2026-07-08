import React from 'react';

// ===== Props Interface =====
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// ===== Component =====
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  /** Tạo mảng số trang hiển thị với dấu "..." */
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Hiển thị tất cả nếu tổng trang ít
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-1.5"
      aria-label="Phân trang"
    >
      {/* Previous */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
        aria-label="Trang trước"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      {/* Page numbers */}
      {pages.map((page, index) =>
        page === '...' ? (
          <span
            key={`dots-${index}`}
            className="flex h-10 w-10 items-center justify-center text-on-surface-variant text-body-sm"
          >
            ···
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`
              flex h-10 w-10 items-center justify-center rounded-xl text-label-md font-medium
              transition-all duration-200 cursor-pointer
              ${
                page === currentPage
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }
            `}
            aria-label={`Trang ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
        aria-label="Trang tiếp"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </nav>
  );
};

export default Pagination;
