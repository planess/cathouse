import { useFormatter, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { VolunteerSectionProps } from '../../models/volunteer-section-props';
import AboutField from '../about-field/about-field';
import ProfileRow from '../profile-row/profile-row';

/**
 * Volunteer details of the current user; only "about" is editable.
 *
 * @param props - Section props.
 * @param props.profile - Profile of a user who is a volunteer.
 */
export default function VolunteerSection({ profile }: VolunteerSectionProps) {
  const t = useTranslations('profilepage');
  const format = useFormatter();
  const formatDate = (date: Date | null) =>
    date ? format.dateTime(date, { dateStyle: 'long' }) : t('personal.empty');
  const rows: { label: string; hint?: string; value: ReactNode }[] = [
    {
      label: t('volunteer.alias'),
      hint: t('volunteer.hints.alias'),
      value: profile.alias || t('personal.empty'),
    },
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
