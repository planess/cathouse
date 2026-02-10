import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import OfferNavigation from '@app/components/offer-navigation/offer-navigation';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import {
  BarChartIcon,
  ReceiptIcon,
} from '../history/[animalId]/components/icons';

import { ReportsContent } from './components/reports-content';

import type { Metadata } from 'next';

export default async function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const t = await getTranslations('reportspage');

  const navigationItems = [
    {
      id: 'impact',
      label: t('nav.items.impact'),
      icon: (
        <span className="material-symbols-outlined text-base">
          <BarChartIcon />
        </span>
      ),
    },
    {
      id: 'financials',
      label: t('nav.items.financials'),
      icon: (
        <span className="material-symbols-outlined text-base">
          <ReceiptIcon />
        </span>
      ),
    },
  ];

  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-8 md:px-20 lg:px-40`}>
      <div className="mb-10 flex flex-col gap-4 border-b border-[#e7ebf4] pb-6 dark:border-[#2d3a52] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-[-0.033em] text-[#0d121c] dark:text-white">
            {t('pageTitle')}
          </h1>
          <p className="text-base text-[#49659c] dark:text-[#a1b2d3]">
            {t('pageDescription')}
          </p>
        </div>
      </div>

      <div className="flex gap-12">
        <aside className="flex-none basis-1/3 hidden lg:block">
          <div className="sticky top-24">
            <OfferNavigation
              title={t('nav.title')}
              subtitle={t('nav.subtitle')}
              items={navigationItems}
            >
              <p className="mb-4 text-center text-[10px] text-[#49659c] dark:text-[#a1b2d3]">
                {t('nav.question')}
              </p>
              <Link
                href="/contacts"
                className="inline-block w-full rounded-full border border-[#256af4] px-4 py-2.5 text-center text-[10px] font-bold text-[#256af4] transition-all hover:bg-[#256af4] hover:text-white"
              >
                {t('nav.contactCta')}
              </Link>
            </OfferNavigation>
          </div>
        </aside>

        <main className="flex-1">
          <ReportsContent initialYear={currentYear} />
        </main>
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
