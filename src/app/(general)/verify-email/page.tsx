import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { getUser } from '@app/hooks/get-user';

import AuthAlert from '../../(guest)/components/auth-alert/auth-alert';
import AuthCard from '../../(guest)/components/auth-card/auth-card';
import type { AuthAlertTone } from '../../(guest)/models/auth-alert-tone';

import type { VerifyEmailResult } from './models/verify-email-result';
import { verifyEmail } from './server/verify-email';

import type { Metadata } from 'next';

const RESULT_TONES: Record<VerifyEmailResult, AuthAlertTone> = {
  verified: 'success',
  'already-verified': 'info',
  invalid: 'error',
  'wrong-user': 'error',
};

export default async function VerifyEmailPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  const { code, email } = await searchParams;
  const [t, result, user] = await Promise.all([
    getTranslations('verifyemailpage'),
    verifyEmail(
      typeof code === 'string' ? code : undefined,
      typeof email === 'string' ? email : undefined,
    ),
    getUser(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col gap-6 py-10">
      <AuthCard title={t('title')}>
        <AuthAlert tone={RESULT_TONES[result]}>
          {t(`result.${result}`)}
        </AuthAlert>
      </AuthCard>

      <p className="m-0 px-6 text-center text-[13px] text-slate-500 dark:text-stone-400">
        <Link
          className="font-semibold text-sky-700 hover:text-slate-900 dark:text-sky-400 dark:hover:text-stone-50"
          href={user ? '/profile/info' : '/signin'}
        >
          {user ? t('profileLink') : t('signinLink')}
        </Link>
        {' · '}
        <Link className="hover:text-slate-900 dark:hover:text-stone-50" href="/">
          {t('backToSite')}
        </Link>
      </p>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('verifyemailpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
    robots: { index: false, follow: false },
  };
}
