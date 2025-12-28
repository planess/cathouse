import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import Card from '../card/card';
import type { AnimalDocument } from '@app/models/animal';

const PAGE_SIZE = 10;

type ListProps = {
  page?: number;
};

export default async function List({ page = 1 }: ListProps) {
  const t = await getTranslations('historypage');
  const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const client = await clientPromise;
  const db = client.db();
  const animalsCollection = db.collection<AnimalDocument>(DbTables.animals);

  const totalItems = await animalsCollection.countDocuments();
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const animals = await animalsCollection
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .toArray();

  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;
  const buildHref = (pageNumber: number) => (pageNumber <= 1 ? '/history' : `/history?page=${pageNumber}`);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4">
        {animals.map((data) => (
          <div key={data._id?.toHexString() ?? data.name}>
            <Card data={data} />
          </div>
        ))}
      </div>

      <nav className="flex items-center justify-center gap-4 text-sm" aria-label={t('pagination.summary', { page: safePage, total: totalPages })}>
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
    </div>
  );
}
