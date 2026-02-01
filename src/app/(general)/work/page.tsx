import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import type { Metadata } from 'next';

const storyHighlightKeys = ['before', 'preparation', 'now', 'goal'] as const;

const helpKeys = ['animals', 'training', 'wildlife', 'cruelty'] as const;

const principleKeys = [
  'humanity',
  'law',
  'responsibility',
  'animal',
  'system',
] as const;

const cycleKeys = [
  'monitoring',
  'capture',
  'prep',
  'sterilization',
  'rehab',
  'return',
] as const;

const noteKeys = ['rodents', 'intervention', 'adoption'] as const;

const faqKeys = ['shelters', 'pets', 'report'] as const;

export default function FundWorkPage() {
  const t = useTranslations('fundworkpage');

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%),radial-gradient(circle_at_20%_30%,_rgba(99,102,241,0.12),_transparent_55%),radial-gradient(circle_at_80%_0%,_rgba(34,197,94,0.12),_transparent_40%)]" />
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto flex max-w-6xl flex-col gap-12">
          <header className="relative overflow-hidden rounded-[28px] border border-slate-200/70 dark:border-slate-700/70 bg-white/85 dark:bg-zinc-900/70 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url(https://lh3.googleusercontent.com/aida-public/AB6AXuB4JmNz0MW91J_iju22I5LdsucR5-k_PXEqTePt1_4C5O7CJNa3H5QRfHWkk1sDKQ4Jw5i94aEoa_4hfHbQJfzpQ3xyI5GWCxoSQup6voNA90aN7m-xehW1YVlvhepY20WbQrcWSa-R2ULdH4Xt3x_T1MyOxdTJdGKXimZiTTZPXHi2cV7U3MLlGTNfrMSyNZCoYbOp_IJsJsJqkX05glITPrYzDeU5GyBObMHegHiJoQZ681Qq2zxt_vsW4B15Sf3nGq5fYXL0sag)',
              }}
            />
            <div className="absolute inset-y-0 left-0 w-full md:w-[50%] bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md" />
            <div className="relative flex flex-col gap-8 p-6 lg:p-10 lg:flex-row lg:items-stretch md:w-[50%]">
              <div className="flex w-full flex-col justify-between gap-6 lg:max-w-xl">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-zinc-800/70 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600 dark:text-slate-300">
                  {t('hero.eyebrow')}
                </span>
                <div className="space-y-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl xl:text-5xl">
                    {t('hero.title')}
                  </h1>
                  <p className="text-sm text-slate-700 dark:text-slate-200 sm:text-base">
                    {t('hero.description')}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/help"
                    className="text-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-slate-800"
                  >
                    {t('hero.ctaPrimary')}
                  </Link>
                  <Link
                    href="/contacts"
                    className="text-center rounded-2xl border border-white/60 bg-white/40 px-6 py-3 text-sm font-semibold text-slate-900 backdrop-blur transition-colors hover:bg-white/70 dark:border-white/20 dark:bg-white/10 dark:text-white"
                  >
                    {t('hero.ctaSecondary')}
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {t('story.title')}
              </h2>
              <div className="h-1.5 w-20 rounded-full bg-sky-600/90" />
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200 sm:text-base">
                {t('story.paragraphs.first')}
              </p>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200 sm:text-base">
                {t('story.paragraphs.second')}
              </p>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200 sm:text-base">
                {t('story.paragraphs.third')}
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-100 dark:border-slate-700 bg-white dark:bg-zinc-900 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.4)]">
              <div className="flex flex-col gap-4">
                {storyHighlightKeys.map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-zinc-800 p-4"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300">
                      {t(`story.highlights.${key}.badge`)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {t(`story.highlights.${key}.title`)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        {t(`story.highlights.${key}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {t('help.title')}
              </h2>
              <p className="mx-auto max-w-3xl text-sm text-slate-500 dark:text-slate-300 sm:text-base">
                {t.rich('help.subtitle', {
                  strong: (children) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                })}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {helpKeys.map((key) => (
                <div
                  key={key}
                  className="group rounded-3xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-zinc-900 p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200">
                    {t(`help.cards.${key}.icon`)}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t(`help.cards.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                    {t(`help.cards.${key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-indigo-950 px-6 py-10 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.8)] sm:px-10">
            <div className="flex flex-col gap-6 mb-12 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <h2 className="text-3xl font-extrabold">
                  {t('principles.title')}
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  {t('principles.subtitle')}
                </p>
              </div>
              <span className="hidden text-xs font-semibold uppercase tracking-widest text-blue-500 md:block whitespace-nowrap">
                {t('principles.badge')}
              </span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {principleKeys.map((key) => (
                <div
                  key={key}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-sm font-bold text-sky-200">
                    {t(`principles.items.${key}.title`)}
                  </p>
                  <p className="mt-2 text-slate-300 text-xs">
                    {t(`principles.items.${key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold">{t('cycle.title')}</h2>
              <p className="mx-auto max-w-2xl text-sm text-slate-500 dark:text-slate-300 sm:text-base">
                {t('cycle.subtitle')}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cycleKeys.map((key, index) => (
                <div
                  key={key}
                  className="group relative overflow-hidden rounded-[26px] border border-slate-100 dark:border-slate-700 bg-white dark:bg-zinc-900 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="absolute right-2 top-2 text-2xl font-black text-slate-100 dark:text-slate-700/40">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-extrabold">
                    {t(`cycle.steps.${key}.title`)}
                  </h3>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">
                    {t(`cycle.steps.${key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-amber-100 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-6">
              <div className="flex items-center gap-3 text-amber-700 dark:text-amber-200">
                <span className="text-lg font-semibold">!</span>
                <h3 className="text-lg font-extrabold uppercase tracking-tight">
                  {t('notes.title')}
                </h3>
              </div>
              <ul className="mt-4 space-y-3 text-xs text-slate-700 dark:text-slate-200">
                {noteKeys.map((key) => (
                  <li key={key} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <p>
                      <span className="font-semibold">
                        {t(`notes.items.${key}.title`)}
                      </span>{' '}
                      {t(`notes.items.${key}.description`)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] border border-sky-100 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 p-6">
              <div className="flex items-center gap-3 text-sky-700 dark:text-sky-200">
                <span className="text-lg font-semibold">✓</span>
                <h3 className="text-lg font-extrabold uppercase tracking-tight">
                  {t('transparency.title')}
                </h3>
              </div>
              <p className="mt-4 text-xs text-slate-600 dark:text-slate-200">
                {t('transparency.description')}
              </p>
              <div className="mt-5">
                <Link
                  href="/reports"
                  className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-sky-700"
                >
                  {t('transparency.cta')}
                </Link>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {t('faq.title')}
              </h2>
            </div>
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {faqKeys.map((key) => (
                <div
                  key={key}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-zinc-900 p-5 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t(`faq.items.${key}.question`)}
                  </h3>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">
                    {t(`faq.items.${key}.answer`)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-sky-600 px-5 py-5 text-white shadow-[0_30px_80px_-50px_rgba(14,116,144,0.6)] md:px-8 lg:px-10 transition-[padding]">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold">
                  {t('callout.title')}
                </h2>
                <p className="mt-2 text-sm text-sky-100">
                  {t('callout.description')}
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row">
                <Link
                  href="/payments#donate"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-sky-700 whitespace-nowrap"
                >
                  {t('callout.ctaHelp')}
                </Link>
                <Link
                  href="/help#contact-form"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-6 py-3 text-sm font-semibold text-white whitespace-nowrap"
                >
                  {t('callout.ctaContact')}
                </Link>
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('fundworkpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
