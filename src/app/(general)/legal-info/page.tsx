import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export default function LegalInfoPage() {
  const t = useTranslations('legalinfopage');

  const requisites = [
    { key: 'fullName', value: t('sections.requisites.items.fullName') },
    { key: 'edrpou', value: t('sections.requisites.items.edrpou') },
    { key: 'location', value: t('sections.requisites.items.location') },
    {
      key: 'contacts',
      value: t.rich('sections.requisites.items.contacts', {
        email: (chunks: ReactNode) => (
          <a
            href="mailto:info@perilines.com.ua"
            className="underline text-cyan-500 dark:text-cyan-400 transition-colors"
          >
            {chunks}
          </a>
        ),
        phone: (chunks: ReactNode) => (
          <a
            href="tel:+380973959022"
            className="underline text-cyan-500 dark:text-cyan-400 transition-colors"
          >
            {chunks}
          </a>
        ),
        telegram: (chunks: ReactNode) => (
          <a
            href="https://t.me/periphery_foundation"
            target="_blank"
            rel="noreferrer"
            className="underline text-cyan-500 dark:text-cyan-400 transition-colors"
          >
            {chunks}
          </a>
        ),
        instagram: (chunks: ReactNode) => (
          <a
            href="https://instagram.com/periphery.foundation"
            target="_blank"
            rel="noreferrer"
            className="underline text-cyan-500 dark:text-cyan-400 transition-colors"
          >
            {chunks}
          </a>
        ),
      }),
    },
    { key: 'head', value: t('sections.requisites.items.head') },
    {
      key: 'nonprofitStatus',
      value: t.rich('sections.requisites.items.nonprofitStatus', {
        link: (chunks: ReactNode) => (
          <a
            href="https://cabinet.tax.gov.ua/registers/non-profit"
            target="_blank"
            rel="noreferrer"
            className="underline text-cyan-500 dark:text-cyan-400 transition-colors"
          >
            {chunks}
          </a>
        ),
      }),
    },
  ];

  const documents = [
    {
      key: 'statute',
      value: t.rich('sections.documents.items.statute', {
        pdf: (chunks: ReactNode) => {
          const sp = chunks?.toString().split('|') ?? [];

          return (
            <a
              href={
                process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL + '/docs' + sp[1]
              }
              target="_blank"
              rel="noreferrer"
              className="underline text-cyan-500 dark:text-cyan-400 transition-colors"
            >
              {sp[0]}
            </a>
          );
        },
      }),
    },
    {
      key: 'privacy',
      value: t.rich('sections.documents.items.privacy', {
        link: (chunks: ReactNode) => (
          <Link
            href="/privacy-policy"
            className="underline text-cyan-500 dark:text-cyan-400 transition-colors"
          >
            {chunks}
          </Link>
        ),
      }),
    },
  ];

  const about = [
    { key: 'mission', value: t('sections.about.items.mission') },
    { key: 'noShelter', value: t('sections.about.items.noShelter') },
    {
      key: 'requests',
      value: t.rich('sections.about.items.requests', {
        email: (chunks: ReactNode) => (
          <a
            href="mailto:info@perilines.com.ua"
            className="underline text-sky-600 dark:text-sky-400 transition-colors"
          >
            {chunks}
          </a>
        ),
      }),
    },
  ];

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col md:flex-row gap-2 md:gap-6 md:items-end transition-[flex-direction] transition-[gap]">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight transition-[font-size]">
            {t('title')}
          </h1>
          <span className="text-sm font-normal text-neutral-700 dark:text-zinc-200 transition-colors text-nowrap whitespace-nowrap">
            {t.rich('checkLink', {
              link: (chunks: ReactNode) => (
                <a
                  href="https://youcontrol.com.ua/catalog/company_details/45962629"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-sky-600 dark:text-sky-400 transition-colors"
                >
                  {chunks}
                </a>
              ),
            })}
          </span>
        </header>

        <div className="space-y-3 md:space-y-4 lg:space-y-6">
          <article className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-zinc-800 p-6 shadow-sm transition-colors">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors">
              {t('sections.requisites.title')}
            </h2>
            <dl className="mt-4 space-y-3 text-slate-500 dark:text-slate-200 transition-colors">
              {requisites.map((item) => (
                <div key={item.key}>
                  <dt className="text-sm font-semibold text-slate-800 dark:text-slate-300 transition-colors">
                    {t(`sections.requisites.labels.${item.key}`)}
                  </dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-zinc-800 p-6 shadow-sm transition-colors">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors">
              {t('sections.documents.title')}
            </h2>
            <ul className="mt-4 list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-200 transition-colors">
              {documents.map((item) => (
                <li key={item.key}>{item.value}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-zinc-800 p-6 shadow-sm transition-colors">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors">
              {t('sections.about.title')}
            </h2>
            <ul className="mt-4 list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-200 transition-colors">
              {about.map((item) => (
                <li key={item.key}>{item.value}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('legalinfopage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
