import { useFormatter, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { CheckIcon } from '@app/components/icons/check-icon';

import type { PersonalSectionProps } from '../../models/personal-section-props';
import NameField from '../name-field/name-field';
import PhoneField from '../phone-field/phone-field';
import ProfileRow from '../profile-row/profile-row';
import SexField from '../sex-field/sex-field';
import VerifyEmailButton from '../verify-email-button/verify-email-button';

/**
 * Shows the current user's editable name, sex, and phone, email with its verification state, and registration date.
 *
 * @param props - Section props.
 * @param props.user - Authenticated user to display.
 * @param props.verificationAvailableAt - ISO time when another verification letter can be sent, or `null` when it can be sent now.
 */
export default function PersonalSection({
  user,
  verificationAvailableAt,
}: PersonalSectionProps) {
  const t = useTranslations('profilepage.personal');
  const format = useFormatter();
  const rows: { label: string; hint?: string; value: ReactNode }[] = [
    {
      label: t('name'),
      value: (
        <NameField
          firstName={user.profile.firstName}
          lastName={user.profile.lastName}
        />
      ),
    },
    { label: t('sex'), value: <SexField sex={user.profile.sex} /> },
    {
      label: t('email'),
      value: (
        <span className="inline-flex items-center gap-2">
          {user.email}
          {user.emailVerified ? (
            <CheckIcon
              aria-hidden={false}
              aria-label={t('verified')}
              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
              role="img"
            />
          ) : (
            <VerifyEmailButton availableAt={verificationAvailableAt} />
          )}
        </span>
      ),
    },
    {
      label: t('phone'),
      hint: t('hints.phone'),
      value: <PhoneField phone={user.profile.phone} />,
    },
    {
      label: t('registered'),
      value: format.dateTime(user.createdAt, { dateStyle: 'long' }),
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{t('title')}</h2>
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
