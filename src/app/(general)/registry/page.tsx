import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { createHistoryGranted } from '@app/accessors/create-history-granted';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import { PlusIcon } from './[animalId]/components/icons';
import List from './components/list/list';

import type { Metadata } from 'next';

export default async function History() {
  const t = await getTranslations('historypage');
  const canCreate = await createHistoryGranted();

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-7">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold dark:text-stone-50 transition-colors">
            {t('title')}
          </h1>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300 transition-colors">
            {t('tracker.subtitle')}
          </p>
        </div>
        <div>
          {canCreate && (
            <div className="text-center flex py-4">
              <Link
                href="/registry/create"
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-2xl hover:bg-sky-600 transition w-full"
              >
                <PlusIcon /> <span>{t('createHistory')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <List />
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('historypage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
