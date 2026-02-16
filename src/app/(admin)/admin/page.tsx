import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import type { Metadata } from 'next';

const highlightCards = [
  {
    title: 'User Management',
    description:
      'Mock: Orchestrate onboarding, verification, and account state changes for the entire shelter network.',
    cta: 'View Users',
    href: '/admin/users',
    accent: 'from-sky-500/20 via-transparent to-transparent',
  },
  {
    title: 'Roles & Permissions',
    description:
      'Mock: Define granular access scopes and align every team with a secure permission matrix.',
    cta: 'Manage Roles',
    href: '/admin/roles',
    accent: 'from-emerald-500/20 via-transparent to-transparent',
  },
];

const helperItems = [
  {
    title: 'Documentation',
    description: 'Mock: Policy and integration guidelines.',
  },
  {
    title: 'System Support',
    description: 'Mock: 24/7 operations escalation path.',
  },
  {
    title: 'Security Logs',
    description: 'Mock: Organization-wide audit trails.',
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/40 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <span>Settings</span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-200">
                Overview
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Admin Settings Overview
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Mock: Centralize control for shelter operations, identity flows,
                and security frameworks across every region.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M11 5.75a5.25 5.25 0 1 1-3.712 8.962l-2.313 2.313"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M15.5 15.5 19 19"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-100/70 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                placeholder="Mock search settings..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center">
                AR
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Mock: Alex Rivera
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Mock: Super Admin
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        {highlightCards.map((card) => (
          <div
            key={card.title}
            className="admin-fade-up group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg shadow-slate-200/40 transition hover:-translate-y-1 hover:border-sky-200 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-sky-500/40"
          >
            <div className={`h-44 bg-gradient-to-br ${card.accent}`}>
              <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_60%)]" />
            </div>
            <div className="flex flex-1 flex-col p-8">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                Mock
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {card.title}
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                {card.description}
              </p>
              <div className="mt-6">
                <Link
                  href={card.href}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600"
                >
                  {card.cta}
                  <span aria-hidden="true">{'->'}</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {helperItems.map((item, index) => (
          <div
            key={item.title}
            className={`admin-fade-up rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70 ${
              index === 1 ? 'admin-fade-up-delay' : ''
            }`}
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {item.title}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {item.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adminpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
