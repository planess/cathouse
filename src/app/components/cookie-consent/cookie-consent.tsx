'use client';

import { useTranslations } from 'next-intl';

import { useCookieAgreement } from '@app/hooks/use-cookie-agreement';

export function CookieConsent() {
  const t = useTranslations('cookieConsent');
  const { isUnknown, setAgree, setReject } = useCookieAgreement();

  if (!isUnknown) {
    return null;
  }

  return (
    <aside className="fixed bottom-2 left-3 right-3 z-50 opacity-90 hover:opacity-100 transition-opacity">
      <div className="mx-auto flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white/90 px-3 py-2 shadow-md backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-700 dark:text-neutral-200 text-center sm:text-left">
          {t('text')}
        </p>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm leading-none text-neutral-500 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            onClick={setReject}
          >
            {t('reject')}
          </button>

          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-500/90 px-4 py-2 text-sm leading-none font-semibold text-white transition hover:bg-emerald-500 focus:outline-2 focus:outline-emerald-300 focus:outline-offset-2 focus:outline-solid"
            onClick={setAgree}
          >
            {t('agree')}
          </button>
        </div>
      </div>
    </aside>
  );
}
