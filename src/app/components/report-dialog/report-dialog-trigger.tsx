'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useCallback, type MouseEvent } from 'react';

import { useModal } from '@app/hooks/use-modal';

type ReportDialogTriggerProps = {
  className?: string;
  text?: string;
};

export function ReportDialogTrigger({ className, text }: ReportDialogTriggerProps) {
  const { showModal } = useModal();
  const t = useTranslations('reportDialog');

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();

      void showModal({
        origin: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        },
        title: t('title'),
        content: (
          <div className="space-y-4">
            <p className="text-base text-slate-700">{t('description')}</p>

            <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/80 p-4 text-sm text-slate-600">
              {t('placeholder')}
            </div>
          </div>
        ),
        dismissLabel: t('closeLabel'),
      });
    },
    [showModal, t],
  );

  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition',
        'bg-rose-400 text-white hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500',
        'active:bg-rose-600 disabled:opacity-60',
        className,
      )}
      onClick={handleClick}
    >
      {text ?? t('buttonLabel')}
    </button>
  );
}
