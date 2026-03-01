import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import type { Metadata } from 'next';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        {t('errorLabel')}
      </p>
      <h1 className="text-3xl font-semibold text-slate-900">{t('title')}</h1>
      <p className="max-w-xl text-sm text-slate-600">{t('description')}</p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        {t('home')}
      </Link>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('notFound'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
