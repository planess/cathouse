import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import AuthShell from '../components/auth-shell/auth-shell';

import RegisterForm from './components/register-form/register-form';

import type { Metadata } from 'next';

export default function Signup() {
  const t = useTranslations('authorization');

  return (
    <AuthShell
      tagline={t('hero.signup.tagline')}
      description={t('hero.signup.description')}
      link={{ href: '/signin', label: t('already-have-account-link') }}
    >
      <RegisterForm />
    </AuthShell>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('authorization'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title.register'), siteTitle),
  };
}
