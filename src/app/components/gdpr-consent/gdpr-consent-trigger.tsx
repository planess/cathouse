'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useCallback, type ReactNode } from 'react';

import { useModal } from '@app/hooks/use-modal';

import { Checkbox } from '../checkbox';

interface GDPRConsentOptions {
  content: ReactNode;
  claim?: string;
  title?: string;
  acceptLabel?: string;
  declineLabel?: string;
  contentClassName?: string;
}

export function useGDPRConsent() {
  const { showModal } = useModal();
  const t = useTranslations('gdpr.default');

  return useCallback(
    (options: GDPRConsentOptions) => {
      const modal = showModal({
        title: options?.title ?? t('title'),
        content: (
          <div
            className={clsx(
              'space-y-4 text-sm text-slate-700 dark:text-slate-200 transition-colors',
              options.contentClassName,
            )}
          >
            <div>{options.content}</div>
            <div>
              <Checkbox
                label={options?.claim ?? t('modal.checkboxLabel')}
                onChange={(checked) =>
                  modal.setActionEnabled('accept', checked)
                }
              />
            </div>
          </div>
        ),
        dismissible: false,
        size: 'lg',
        actions: [
          {
            label: options?.declineLabel ?? t('declineLabel'),
            tone: 'secondary',
            value: false,
          },
          {
            id: 'accept',
            label: options?.acceptLabel ?? t('acceptLabel'),
            tone: 'primary',
            value: true,
            disabled: true,
          },
        ],
      });

      return modal;
    },
    [showModal, t],
  );
}
