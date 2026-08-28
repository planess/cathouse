'use client';

type PaginationProps = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const lastPage = Math.max(1, Math.ceil(totalItems / pageSize));

  if (lastPage === 1) {
    return null;
  }

  const pages = [
    ...new Set([
      1,
      ...Array.from(
        { length: 5 },
        (_, index) => currentPage - 2 + index,
      ).filter((page) => page > 1 && page < lastPage),
      lastPage,
    ]),
  ];

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1 p-4"
    >
      {pages.map((page, index) => (
        <span className="flex items-center gap-1" key={page}>
          {index > 0 && page - pages[index - 1] > 1 && (
            <span className="px-1 text-slate-400">…</span>
          )}
          <button
            aria-current={page === currentPage ? 'page' : undefined}
            className={`min-w-8 rounded-lg px-2 py-1 text-sm font-semibold transition ${
              page === currentPage
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        </span>
      ))}
    </nav>
  );
}
