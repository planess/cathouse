'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * Header of the email contacts page with a Back link to the mailbox the user
 * came from. Reads `returnTo` on the client so it can render instantly in the
 * route loading state, before any server data is available.
 */
export function EmailContactsHeader() {
  const t = useTranslations('adminEmail');
  const returnTo = useSearchParams().get('returnTo');
  const backHref =
    returnTo !== null && /^\/admin\/email\/[a-f\d]{24}$/i.test(returnTo)
      ? returnTo
      : '/admin/email';

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t('contacts.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('contacts.description')}
        </p>
      </div>
      <Link
        className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
        href={backHref}
      >
        {t('common.back')}
      </Link>
    </header>
  );
}
