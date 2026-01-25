import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import OfferNavigation from '@app/components/offer-navigation/offer-navigation';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import NewSeasonReport from './new-season';

import type { Metadata } from 'next';

export default function ReportsPage() {
  const t = useTranslations('reportspage');

  return (
    <div className="px-4 py-8 md:px-8 lg:px-12 mx-auto max-w-7xl space-y-6 w-full transition-[padding]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 pb-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">
            {t('title')}
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-200 transition-colors">
            {t('intro')}
          </p>
        </div>

        {/* <button >Завантажити PDF</button> */}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="hidden lg:block lg:w-1/3">
          <div className="sticky top-8">
            <OfferNavigation
              title={t('nav.title')}
              subtitle={t('nav.subtitle')}
              items={[]}
            >
              <div className="text-xs mb-3 text-gray-600 dark:text-zinc-400">
                {t('nav.question')}
              </div>
              <Link
                href="/contacts"
                className="inline-block text-center w-full py-2 px-4 border border-blue-600 text-blue-600 text-xs font-bold rounded-full hover:bg-blue-600 hover:text-blue-100 transition-colors"
              >
                {t('nav.contactCta')}
              </Link>
            </OfferNavigation>
          </div>
        </aside>

        <div className="lg:w-2/3 space-y-12 pb-20">
          <NewSeasonReport />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('reportspage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
