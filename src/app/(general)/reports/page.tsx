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

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();

  const navigationItems = [
    {
      id: 'impact',
      label: 'Вплив та статистика',
      icon: (
        <span className="material-symbols-outlined text-base">
          <BarChartIcon />
        </span>
      ),
    },
    {
      id: 'financials',
      label: 'Фінансові звіти',
      icon: (
        <span className="material-symbols-outlined text-base">
          <ReceiptIcon />
        </span>
      ),
    },
  ];

  return (
    <div className={`mx-auto w-full max-w-300 px-4 py-8 md:px-20 lg:px-40`}>
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link
          className="text-[#49659c] transition-colors hover:text-[#256af4]"
          href="/"
        >
          Головна
        </Link>
        <span className="text-[#49659c]">/</span>
        <span className="font-medium">Звітність фонду</span>
      </div>

      <div className="mb-10 flex flex-col gap-4 border-b border-[#e7ebf4] pb-6 dark:border-[#2d3a52] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-[-0.033em] text-[#0d121c] dark:text-white">
            Звітність фонду
          </h1>
          <p className="text-base text-[#49659c] dark:text-[#a1b2d3]">
            Ми віримо у повну прозорість. Тут ви можете ознайомитись із
            результатами нашої роботи та фінансовими звітами.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-12 lg:flex-row">
        <aside className="order-2 lg:order-1 lg:w-1/3">
          <div className="sticky top-24">
            <OfferNavigation
              title="Навігація по звітах"
              subtitle="Оновлюється автоматично щоденно"
              items={navigationItems}
            >
              <p className="mb-4 text-center text-[10px] text-[#49659c] dark:text-[#a1b2d3]">
                Виникли питання щодо звітності?
              </p>
              <Link
                href="/contacts"
                className="inline-block w-full rounded-full border border-[#256af4] px-4 py-2.5 text-center text-[10px] font-bold text-[#256af4] transition-all hover:bg-[#256af4] hover:text-white"
              >
                Написати нам
              </Link>
            </OfferNavigation>
          </div>
        </aside>

        <main className="order-1 lg:order-2 lg:w-2/3">
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
