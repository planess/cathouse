import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import {
  BookOpenIcon,
  HomeIcon,
  ShieldAlertIcon,
} from '../components/icons';

import type { Metadata } from 'next';

const adoptionRegistryHref = '/registry?status=adoption';

export default async function AdoptionProcessPage() {
  const t = await getTranslations('adoptionprocesspage');

  const highlights = ['care', 'review', 'handover'].map((key) =>
    t(`highlights.${key}`),
  );

  const heroSummary = ['review', 'transfer', 'refusal'].map((key) =>
    t(`hero.summary.${key}`),
  );

  const considerations = [
    {
      id: 'street',
      title: t('considerations.cards.street.title'),
      description: t('considerations.cards.street.description'),
      icon: <BookOpenIcon />,
      iconColorClassName: 'text-sky-700 dark:text-sky-200',
      iconBackgroundClassName: 'bg-sky-500/10 dark:bg-sky-500/20',
    },
    {
      id: 'firstTime',
      title: t('considerations.cards.firstTime.title'),
      description: t('considerations.cards.firstTime.description'),
      icon: <ShieldAlertIcon />,
      iconColorClassName: 'text-amber-700 dark:text-amber-200',
      iconBackgroundClassName: 'bg-amber-500/10 dark:bg-amber-500/20',
    },
    {
      id: 'currentPets',
      title: t('considerations.cards.currentPets.title'),
      description: t('considerations.cards.currentPets.description'),
      icon: <HomeIcon />,
      iconColorClassName: 'text-emerald-700 dark:text-emerald-200',
      iconBackgroundClassName: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    },
  ];

  const officialTransferSteps = [
    {
      id: 'availableCats',
      title: t('officialTransfer.items.availableCats.title'),
      description: t('officialTransfer.items.availableCats.description'),
      numberClassName:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
    },
    {
      id: 'discussion',
      title: t('officialTransfer.items.discussion.title'),
      description: t('officialTransfer.items.discussion.description'),
      numberClassName:
        'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200',
    },
    {
      id: 'agreement',
      title: t('officialTransfer.items.agreement.title'),
      description: t('officialTransfer.items.agreement.description'),
      numberClassName:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200',
    },
    {
      id: 'finalTransfer',
      title: t('officialTransfer.items.finalTransfer.title'),
      description: t('officialTransfer.items.finalTransfer.description'),
      numberClassName:
        'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-800 dark:bg-fuchsia-950/30 dark:text-fuchsia-200',
    },
  ];

  return (
    <div className="overflow-hidden bg-[linear-gradient(180deg,rgba(240,249,255,0.8),rgba(255,255,255,0))] dark:bg-none">
      <section className="relative isolate px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute inset-x-0 top-0 -z-10 h-140 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_42%),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_25%_45%,rgba(251,191,36,0.16),transparent_24%)]" />

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_340px] lg:items-start">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-sm backdrop-blur dark:border-sky-900/70 dark:bg-zinc-900/75 dark:text-sky-200">
              {t('hero.eyebrow')}
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                {t('hero.title')}
              </h1>

              <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-200">
                {t('hero.description')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((highlight, index) => (
                <div
                  key={highlight}
                  className={[
                    'rounded-3xl border px-4 py-4 text-sm font-medium leading-6 shadow-sm backdrop-blur',
                    index === 0 &&
                      'border-sky-200 bg-white/85 text-slate-700 dark:border-sky-900/70 dark:bg-zinc-900/75 dark:text-slate-100',
                    index === 1 &&
                      'border-amber-200 bg-white/85 text-slate-700 dark:border-amber-900/70 dark:bg-zinc-900/75 dark:text-slate-100',
                    index === 2 &&
                      'border-emerald-200 bg-white/85 text-slate-700 dark:border-emerald-900/70 dark:bg-zinc-900/75 dark:text-slate-100',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {highlight}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={adoptionRegistryHref}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-sky-300"
              >
                {t('hero.primaryCta')}
              </Link>

              <Link
                href="/contacts"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-slate-100 dark:hover:border-sky-400 dark:hover:bg-sky-950/40 dark:hover:text-sky-200"
              >
                {t('hero.secondaryCta')}
              </Link>
            </div>

            <div className="rounded-4xl border border-dashed border-sky-200 bg-white/75 p-5 shadow-sm backdrop-blur dark:border-sky-900/80 dark:bg-zinc-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
                {t('hero.noteLabel')}
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-200">
                {t('hero.prototypeNote')}
              </p>
            </div>
          </div>

          <aside className="overflow-hidden rounded-4xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_-50px_rgba(15,23,42,0.55)] backdrop-blur dark:border-zinc-700/70 dark:bg-zinc-900/85">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300">
              {t('hero.summaryLabel')}
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-200">
              {t('hero.summaryIntro')}
            </p>

            <div className="mt-6 space-y-3">
              {heroSummary.map((item, index) => (
                <div
                  key={item}
                  className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-4 dark:border-zinc-700 dark:bg-zinc-800/80"
                >
                  <div className="inline-flex rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:border-zinc-600 dark:text-slate-300">
                    0{index + 1}
                  </div>

                  <p className="mt-3 text-sm font-medium leading-6 text-slate-700 dark:text-slate-100">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700 dark:text-sky-300">
              {t('considerations.eyebrow')}
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              {t('considerations.title')}
            </h2>

            <p className="text-base leading-8 text-slate-600 dark:text-slate-200">
              {t('considerations.description')}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {considerations.map((card) => (
              <article
                key={card.id}
                className="rounded-4xl border border-slate-200 bg-white/85 p-6 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.4)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80"
              >
                <div
                  className={[
                    'inline-flex rounded-2xl p-3',
                    card.iconBackgroundClassName,
                    card.iconColorClassName,
                  ].join(' ')}
                >
                  {card.icon}
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                  {card.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-200">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700 dark:text-sky-300">
              {t('policy.eyebrow')}
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              {t('policy.title')}
            </h2>

            <blockquote className="mt-6 rounded-3xl border-l-4 border-amber-300 bg-amber-50/90 p-5 text-base font-medium italic text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">
              {t('policy.quote')}
            </blockquote>
          </div>

          <div className="rounded-4xl border border-slate-200 bg-white/85 p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80 sm:p-8">
            <div className="space-y-5 text-base leading-8 text-slate-700 dark:text-slate-200">
              <p>{t('policy.paragraph1')}</p>
              <p>{t('policy.paragraph2')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              {t('officialTransfer.title')}
            </h2>

            <p className="text-base leading-8 text-slate-600 dark:text-slate-200">
              {t('officialTransfer.description')}
            </p>
          </div>

          <div className="h-px bg-slate-200 dark:bg-zinc-800" />

          <div className="grid gap-4 lg:grid-cols-2">
            {officialTransferSteps.map((step, index) => (
              <article
                key={step.id}
                className="rounded-4xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80 sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={[
                      'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-black shadow-sm',
                      step.numberClassName,
                    ].join(' ')}
                  >
                    {index + 1}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-200">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-4xl border border-rose-200 bg-rose-50/85 p-6 shadow-sm dark:border-rose-900/70 dark:bg-rose-950/20 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="inline-flex rounded-2xl bg-rose-500/10 p-3 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200">
                <ShieldAlertIcon />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-rose-950 dark:text-rose-100">
                  {t('conflictAlert.title')}
                </h2>

                <p className="mt-3 max-w-4xl text-base leading-8 text-rose-900/90 dark:text-rose-100/90">
                  {t('conflictAlert.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adoptionprocesspage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
