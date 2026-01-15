'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useCallback, type MouseEvent } from 'react';

import {
  InstagramIcon,
  PhoneIcon,
  TelegramIcon,
} from '@app/(general)/history/[animalId]/components/icons';
import { useModal } from '@app/hooks/use-modal';

import Alert from '../alert/alert';

type ReportDialogTriggerProps = {
  className?: string;
  text?: string;
};

export function ReportDialogTrigger({
  className,
  text,
}: ReportDialogTriggerProps) {
  const { showModal } = useModal();
  const t = useTranslations('reportDialog');

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();

      void showModal({
        size: 'xl',
        origin: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        },
        title: t('title'),
        content: (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((val) => (
              <div className="text-base text-slate-700" key={val}>
                {t.rich(`description${val}`, {
                  strong: (children) => (
                    <strong className="font-bold">{children}</strong>
                  ),
                  highlight: (children) => {
                    const sp = String(children)?.split('|');

                    return (
                      <a
                        href={sp[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-cyan-600 underline underline-offset-2 hover:text-cyan-700"
                      >
                        {sp[1]}
                      </a>
                    );
                  },
                  info: (children) => <Alert text={children} />,
                })}
              </div>
            ))}

            <hr className="border-gray-200" />

            <div>{t('description')}</div>

            <div className="flex flex-col gap-4">
              <a
                className="flex gap-2 items-center"
                href="tel: +380973959022"
                target="_blank"
              >
                <span className="text-sky-300 basis-5">
                  <PhoneIcon />
                </span>
                <span>+38(097) 39 59 022</span>
              </a>

              <a
                href="https://t.me/periphery_foundation"
                target="_blank"
                className="flex gap-2 items-center"
              >
                <span className="text-sky-300 size-6">
                  <TelegramIcon />
                </span>
                <span>periphery_foundation</span>
              </a>

              <a
                href="https://instagram.com/periphery.foundation"
                target="_blank"
                className="flex gap-2 items-center "
              >
                <span className="text-sky-300 size-6">
                  <InstagramIcon />
                </span>
                <span>periphery.foundation</span>
              </a>
            </div>
          </div>
        ),
        dismissible: true,
        actions: [],
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
