import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface PaginationProps {
  safePage: number;
  totalPages: number;
}

const buildHref = (pageNumber: number) =>
  pageNumber <= 1 ? '/history' : `/history?page=${pageNumber}`;

export default async function Pagination({
  safePage,
  totalPages,
}: PaginationProps) {
  const t = await getTranslations('historypage');
  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  return (
    <nav
      className="flex items-center justify-center gap-4 text-sm"
      aria-label={t('pagination.summary', {
        page: safePage,
        total: totalPages,
      })}
    >
      {hasPrev ? (
        <Link
          href={buildHref(safePage - 1)}
          className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          aria-label={t('pagination.previous')}
        >
          {t('pagination.previous')}
        </Link>
      ) : (
        <span
          className="px-3 py-1 rounded border border-gray-200 text-gray-400 cursor-not-allowed select-none"
          aria-disabled="true"
        >
          {t('pagination.previous')}
        </span>
      )}

      <span className="text-gray-600">
        {t('pagination.summary', { page: safePage, total: totalPages })}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(safePage + 1)}
          className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          aria-label={t('pagination.next')}
        >
          {t('pagination.next')}
        </Link>
      ) : (
        <span
          className="px-3 py-1 rounded border border-gray-200 text-gray-400 cursor-not-allowed select-none"
          aria-disabled="true"
        >
          {t('pagination.next')}
        </span>
      )}
    </nav>
  );
}
