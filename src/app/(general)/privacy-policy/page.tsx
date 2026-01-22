import { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { useMemo } from 'react';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import type { Metadata } from 'next';

const sectionItems: Record<string, string[]> = {
  who: ['controller', 'edrpou', 'email', 'contactPerson'],
  definitions: [
    'intro',
    'personalData',
    'processing',
    'subject',
    'controller',
    'processor',
  ],
  children: ['open', 'noTarget', 'under14Consent', 'noSensitive'],
  sensitive: ['ban', 'exception'],
  collection: ['contact', 'technical', 'content', 'payments', 'notice'],
  analytics: ['data', 'use', 'consent'],
  use: [
    'respond',
    'organize',
    'volunteers',
    'reporting',
    'maintain',
    'legal',
    'noAutomated',
  ],
  basis: ['consent', 'request', 'obligation', 'legitimate', 'principles'],
  cookies: ['necessary', 'noAds', 'analytics', 'control', 'withdraw'],
  email: ['purpose', 'optout', 'notice'],
  sharing: [
    'partners',
    'clinics',
    'payments',
    'providers',
    'noSale',
    'noMarketingTargeting',
    'legal',
    'processors',
    'notice',
  ],
  international: ['transfers', 'safeguards', 'adequacy'],
  retention: [
    'duration',
    'inquiries',
    'volunteer',
    'financial',
    'cleanup',
    'deletionNotice',
  ],
  breach: ['response'],
  security: ['measures', 'accessControl', 'measuresDetails'],
  updates: ['changes', 'material', 'effective'],
};

export default function PrivacyPolicyPage() {
  const t = useTranslations('privacypage');

  const updatedDate = useMemo(
    () =>
      DateTime.fromISO('2026-01-21').toLocaleString(DateTime.DATE_FULL, {
        locale: 'uk-UA',
      }),
    [],
  );

  const sections = Object.entries(sectionItems).map(([key, items]) => ({
    key,
    title: t(`sections.${key}.title`),
    items: items.map((itemKey) => ({
      key: itemKey,
      label: t.rich(`sections.${key}.items.${itemKey}`, {
        email: (chunks: React.ReactNode) => (
          <a href="mailto:info@perilines.com.ua">{chunks}</a>
        ),
        consentDate: updatedDate,
      }),
    })),
  }));

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {t('title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300 transition-colors">
              {t('updated', { date: updatedDate })}
            </p>
          </div>
          <p className="text-base text-slate-600 dark:text-slate-200 transition-colors">
            {t('intro')}
          </p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.key} className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors">
                {section.title}
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-200 transition-colors">
                {section.items.map((item) => (
                  <li key={item.key}>{item.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-zinc-800 p-6 shadow-sm transition-colors">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 transition-colors">
            {t('sections.contact.title')}
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-200 transition-colors">
            {t('sections.contact.description')}
          </p>
          <a
            href="mailto:info@perilines.com.ua"
            className="mt-4 inline-flex items-center font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 transition-colors"
          >
            {t('sections.contact.emailLabel')}
          </a>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('privacypage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
