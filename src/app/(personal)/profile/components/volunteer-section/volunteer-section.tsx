import { useFormatter, useTranslations } from 'next-intl';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { ExternalLinkIcon } from '@app/components/icons/adoption-e-xt-er-na-ll-in-ki-co-n';

import type { VolunteerSectionProps } from '../../models/volunteer-section-props';
import AboutField from '../about-field/about-field';
import ProfilePhotoField from '../profile-photo-field/profile-photo-field';
import ProfileRow from '../profile-row/profile-row';

/**
 * Volunteer details of the current user; only "about" and the photo are editable.
 *
 * @param props - Section props.
 * @param props.profile - Profile of a user who is a volunteer.
 * @param props.userId - Identifier of the user in the `users` collection.
 * @param props.photoUrl - Public URL of the profile photo, or `null`.
 */
export default function VolunteerSection({
  profile,
  userId,
  photoUrl,
}: VolunteerSectionProps) {
  const t = useTranslations('profilepage');
  const format = useFormatter();
  const formatDate = (date: Date | null) =>
    date ? format.dateTime(date, { dateStyle: 'long' }) : t('personal.empty');
  const personalPageHref = `/volunteers/${userId}`;
  const rows: { label: string; hint?: string; value: ReactNode }[] = [
    {
      label: t('volunteer.personalPage'),
      value: (
        <Link
          className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
          href={personalPageHref}
          rel="noopener noreferrer"
          target="_blank"
        >
          {userId}
          <ExternalLinkIcon />
        </Link>
      ),
    },
    // Alias is shown only when it is set
    ...(profile.alias
      ? [
          {
            label: t('volunteer.alias'),
            hint: t('volunteer.hints.alias'),
            value: profile.alias,
          },
        ]
      : []),
    { label: t('volunteer.hiredOn'), value: formatDate(profile.hiredOn) },
    {
      label: t('volunteer.badgeValidUntil'),
      hint: t('volunteer.hints.badgeValidUntil'),
      value: formatDate(profile.badgeValidUntil),
    },
    {
      label: t('volunteer.about'),
      hint: t('volunteer.hints.about'),
      value: <AboutField about={profile.about} />,
    },
    {
      label: t('volunteer.photo'),
      hint: t('volunteer.hints.photo'),
      value: <ProfilePhotoField photoUrl={photoUrl} />,
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{t('volunteer.title')}</h2>
      <dl className="divide-y divide-slate-200 rounded-xl bg-white dark:divide-stone-700 dark:bg-stone-900">
        {rows.map(({ label, hint, value }) => (
          <ProfileRow hint={hint} key={label} label={label}>
            {value}
          </ProfileRow>
        ))}
      </dl>
    </section>
  );
}
