import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { HeartIcon } from '@app/components/icons/heart-icon';
import { InfoCircleIcon } from '@app/components/icons/info-circle-icon';
import { LockIcon } from '@app/components/icons/lock-icon';
import { PiggyBankIcon } from '@app/components/icons/piggy-bank-icon';

/**
 * Temporary notice shown on the reports page while the foundation's spending
 * is restricted: donations are accumulated and used only for buying goods or
 * paying for legal services, while volunteers cover the other expenses from
 * their own resources.
 */
export default async function ReportsFundsOnHold() {
  const t = await getTranslations('reportspage.fundsOnHold');

  const points = [
    { key: 'accumulate', icon: <PiggyBankIcon /> },
    { key: 'limitedSpending', icon: <LockIcon /> },
    { key: 'volunteers', icon: <HeartIcon /> },
  ] as const;

  return (
    <section className="mx-auto w-full max-w-3xl rounded-[30px] border border-[#256af4]/30 bg-white px-6 py-12 text-center shadow-[0_18px_60px_rgba(37,106,244,0.08)] transition-colors dark:border-[#2d3a52] dark:bg-[#1c2636] dark:shadow-[0_18px_60px_rgba(0,0,0,0.30)] sm:px-10">
      <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
        <span className="inline-block size-4">
          <InfoCircleIcon />
        </span>
        {t('eyebrow')}
      </p>
      <h2 className="mb-4 text-2xl font-black tracking-tight text-[#0d121c] dark:text-white sm:text-3xl">
        {t('title')}
      </h2>
      <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-[#49659c] dark:text-[#a1b2d3]">
        {t('description')}
      </p>

      <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
        {points.map(({ key, icon }) => (
          <div
            key={key}
            className="rounded-2xl border border-[#e7ebf4] bg-[#f8fafc] p-4 dark:border-[#2d3a52] dark:bg-[#253247]"
          >
            <span className="mb-3 inline-block size-7 text-[#256af4]">
              {icon}
            </span>
            <h3 className="mb-1 text-sm font-bold text-[#0d121c] dark:text-zinc-100">
              {t(`points.${key}.title`)}
            </h3>
            <p className="text-xs leading-relaxed text-[#49659c] dark:text-[#a1b2d3]">
              {t(`points.${key}.description`)}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-10 mb-4 text-sm text-[#7a8bb1]">{t('footnote')}</p>
      <Link
        href="/contacts"
        className="inline-flex items-center justify-center rounded-full border border-[#256af4] px-6 py-2.5 text-sm font-bold text-[#256af4] transition-all hover:bg-[#256af4] hover:text-white"
      >
        {t('contactCta')}
      </Link>
    </section>
  );
}
