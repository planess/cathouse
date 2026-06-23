import clsx from 'clsx';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import { loadVolunteer } from './server/load-volunteer';

import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getTrimmedValue(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
}

function getVolunteerName(
  volunteer: NonNullable<Awaited<ReturnType<typeof loadVolunteer>>>,
  fallbackLabel: string,
): string {
  const alias = getTrimmedValue(volunteer.profile?.alias);

  if (alias) {
    return alias;
  }

  const firstName = getTrimmedValue(volunteer.profile?.firstName);
  const lastName = getTrimmedValue(volunteer.profile?.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  if (fullName !== '') {
    return fullName;
  }

  const email = getTrimmedValue(volunteer.user.email);

  return email ?? fallbackLabel;
}

function getLocaleDate(locale: string, value: Date): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(value);
}

function getProfilePhotoUrl(profilePhoto: string | null | undefined) {
  const imageBaseUrl = process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL;
  const normalizedProfilePhoto = getTrimmedValue(profilePhoto);

  if (imageBaseUrl === undefined || normalizedProfilePhoto === null) {
    return null;
  }

  if (/^https?:\/\//i.test(normalizedProfilePhoto)) {
    return normalizedProfilePhoto;
  }

  return `${imageBaseUrl.replace(/\/$/, '')}/${normalizedProfilePhoto.replace(
    /^\//,
    '',
  )}`;
}

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:-translate-x-1"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 12H5m0 0 6-6m-6 6 6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 12.4 11.1 14.5 15.5 9.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3 5 6v5c0 4.97 2.96 8.86 7 10 4.04-1.14 7-5.03 7-10V6l-7-3Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default async function VolunteerPage({ params }: PageProps) {
  const { id } = await params;
  const [locale, t, volunteer] = await Promise.all([
    getLocale(),
    getTranslations('volunteerpage'),
    loadVolunteer(id),
  ]);

  if (!volunteer) {
    notFound();
  }

  const displayName = getVolunteerName(volunteer, t('fallbackName'));
  const joinedDate = getLocaleDate(locale, new Date(volunteer.user.createdAt));
  const expirationDate = volunteer.profile?.badgeValidUntil
    ? getLocaleDate(locale, new Date(volunteer.profile.badgeValidUntil))
    : null;
  const statusLabel = volunteer.user.isActive
    ? t('status.active')
    : t('status.inactive');
  const aboutName = getTrimmedValue(displayName.split(' ')[0]) ?? displayName;
  const profilePhotoUrl = getProfilePhotoUrl(volunteer.profile?.profilePhoto);
  const summary = volunteer.profile?.about ?? null;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      <div className="relative px-6 py-6 md:px-12">
        <Link
          className="group inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          href="/volunteers"
        >
          <ArrowLeftIcon />
          {t('labels.backToInfo')}
        </Link>
      </div>

      <section className="relative flex min-h-[calc(100vh-9rem)]">
        <div
          className={clsx(
            'relative flex flex-col justify-center px-6 py-8 md:w-1/2 md:px-12 lg:w-[55%] lg:px-20 z-1',
            { 'bg-white/50 md:bg-transparent': profilePhotoUrl !== null },
          )}
        >
          <div className="mb-8 flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 shadow-sm">
            {volunteer.user.isActive && <CheckCircleIcon />}
            {statusLabel}
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-950 lg:text-7xl">
            {displayName}
          </h1>

          <p className="mb-10 mt-2 text-2xl font-medium tracking-wide text-emerald-700">
            {t('labels.roleTitle')}
          </p>

          <div className="space-y-8">
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                {t('labels.about', { name: aboutName })}
              </h2>
              <p className="text-lg leading-relaxed text-slate-700">
                {summary}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-slate-500">
                <span className="text-emerald-600">
                  <CalendarIcon />
                </span>
                <span className="text-lg">
                  {t('labels.joined')}{' '}
                  <strong className="font-semibold text-slate-900">
                    {joinedDate}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500">
                <span className="text-emerald-600">
                  <CalendarIcon />
                </span>
                <span className="text-lg">
                  {t('labels.until')}{' '}
                  <strong className="font-semibold text-slate-900">
                    {expirationDate}
                  </strong>
                </span>
              </div>
            </div>

            <div className="max-w-md rounded-2xl bg-amber-50/90 p-6 shadow-sm">
              <p className="flex items-start gap-3 text-sm italic leading-relaxed text-amber-900/90">
                <span className="mt-0.5 shrink-0 text-amber-600">
                  <ShieldIcon />
                </span>
                {t('officialStatement')}
              </p>
            </div>
          </div>
        </div>

        {profilePhotoUrl !== null ? (
          <>
            <div className="absolute right-0 top-0 h-full w-[55%] lg:max-w-[25%] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-l from-slate-50/25 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50/35 via-transparent to-transparent" />
              <div
                aria-label={displayName}
                className="h-full w-full bg-cover bg-top bg-no-repeat"
                role="img"
                style={{ backgroundImage: `url("${profilePhotoUrl}")` }}
              />
            </div>
          </>
        ) : (
          ''
        )}
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const [t, siteTitle] = await Promise.all([
    getTranslations('volunteerpage'),
    getSiteTitle(),
  ]);

  const volunteer = await loadVolunteer(id);

  if (!volunteer) {
    return {
      title: composeMetadataTitle(t('title'), siteTitle),
    };
  }

  return {
    title: composeMetadataTitle(
      getVolunteerName(volunteer, t('fallbackName')),
      siteTitle,
    ),
  };
}
