import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import type { Metadata } from 'next';

const volunteerPointKeys = ['fieldWork', 'skill', 'roles', 'team'] as const;
const frontBadgeKeys = ['volunteerQr', 'expiration', 'badgeColor'] as const;
const backBadgeKeys = ['registryQr', 'contacts', 'directorSignature'] as const;

const badgeCardFrontImage =
  process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL + '/badge_example.png';
const badgeCardBackImage =
  process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL + '/badge_example_back.png';

function Dot({ className }: { className: string }) {
  return (
    <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${className}`} />
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-emerald-500"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m5 12 4.2 4.2L19 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 19a4 4 0 0 0-8 0M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 7a3 3 0 0 0-3-3m0-4a2.5 2.5 0 1 0 0-5M5 19a3 3 0 0 1 3-3m-3-4a2.5 2.5 0 1 1 0-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 20s-7.5-4.4-9.2-9.2C1.8 7.9 3.7 5.5 6.5 5.5c1.7 0 3.2.9 4 2.2.8-1.3 2.3-2.2 4-2.2 2.8 0 4.7 2.4 3.7 5.3C19.5 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function IdCardIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-32 w-32"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        width="20"
        x="2"
        y="5"
      />
      <circle cx="8" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 16c.8-1.5 2-2.2 3.5-2.2s2.7.7 3.5 2.2M14 10h4M14 13h4M14 16h3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function BadgeCardImage({ alt, src }: { alt: string; src: string }) {
  return (
    <Image
      alt={alt}
      className="mx-auto h-auto"
      height={820}
      src={src}
      width={560}
    />
  );
}

export default function VolunteerInfoPage() {
  const t = useTranslations('volunteerinfopage');

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_45%),radial-gradient(circle_at_15%_20%,_rgba(14,165,233,0.12),_transparent_38%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.92))]" />

      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-14 pb-16">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <UsersIcon />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {t('who.title')}
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-lg leading-relaxed text-slate-600">
              <p>{t('who.description')}</p>
              <p>{t('who.expenses')}</p>
            </div>

            <ul className="space-y-4">
              {volunteerPointKeys.map((key) => (
                <li
                  key={key}
                  className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <CheckIcon />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t(`who.points.${key}.title`)}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {t(`who.points.${key}.description`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white px-6 py-8 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.5)] md:px-8 md:py-10">
            <div className="pointer-events-none absolute right-4 top-0 text-slate-100">
              <IdCardIcon />
            </div>

            <div className="relative space-y-12">
              <div className="mx-auto max-w-2xl space-y-4 text-center">
                <span className="inline-flex rounded-full bg-emerald-100 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-700">
                  {t('badge.sectionLabel')}
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {t('badge.title')}
                </h2>
                <p className="text-base leading-relaxed text-slate-600">
                  {t('badge.description')}
                </p>
              </div>

              <div className="grid items-start gap-12 lg:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="flex items-center gap-3 text-xl font-semibold text-slate-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      1
                    </span>
                    {t('badge.front.title')}
                  </h3>

                  <BadgeCardImage
                    alt={t('badge.front.title')}
                    src={badgeCardFrontImage}
                  />

                  <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-6">
                    <ul className="space-y-4">
                      {frontBadgeKeys.map((key) => (
                        <li key={key} className="flex gap-3">
                          <Dot className="bg-emerald-600" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {t(`badge.front.items.${key}.title`)}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                              {t(`badge.front.items.${key}.description`)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="flex items-center gap-3 text-xl font-semibold text-slate-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                      2
                    </span>
                    {t('badge.back.title')}
                  </h3>

                  <BadgeCardImage
                    alt={t('badge.back.title')}
                    src={badgeCardBackImage}
                  />

                  <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-6">
                    <ul className="space-y-4">
                      {backBadgeKeys.map((key) => (
                        <li key={key} className="flex gap-3">
                          <Dot className="bg-slate-500" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {t(`badge.back.items.${key}.title`)}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                              {t(`badge.back.items.${key}.description`)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 rounded-[32px] border border-emerald-100 bg-emerald-50/60 px-6 py-8 md:px-8">
            <div className="flex items-center gap-3">
              <span className="text-emerald-700">
                <HeartIcon />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {t('support.sectionLabel')}
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {t('support.title')}
                </h2>
              </div>
            </div>

            <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-slate-600">
              <p>{t('support.description')}</p>
              <p>{t('support.help')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('volunteerinfopage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
