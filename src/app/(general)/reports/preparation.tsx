import { useTranslations } from 'next-intl';

import Section from './section';

interface PreparationComponentProps {
  showBalance?: boolean;
}

export default function PreparationComponent({
  showBalance,
}: PreparationComponentProps) {
  const t = useTranslations('reportspage.preparation');

  return (
    <Section className="border-dashed border-[#d9dfed] dark:border-[#2d3a52]">
      <div className="flex flex-col gap-5 px-2 py-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t('title')}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {t('description')}
          </p>
        </div>

        {showBalance && (
          <div className="mx-auto flex w-full max-w-md flex-wrap items-center justify-center gap-3">
            <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {t('zeroBalance.incoming')}
            </div>
            <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {t('zeroBalance.outgoing')}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
