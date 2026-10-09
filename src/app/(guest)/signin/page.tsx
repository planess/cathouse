import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import AuthShell from '../components/auth-shell/auth-shell';

import AuthForm from './components/auth-form/auth-form';

import type { Metadata } from 'next';

export default function Signin() {
  const t = useTranslations('authorization');

  return (
    <AuthShell
      tagline={t('hero.signin.tagline')}
      description={t('hero.signin.description')}
      link={{ href: '/signup', label: t('want-account-link') }}
    >
      <AuthForm />
    </AuthShell>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('authorization'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title.auth'), siteTitle),
  };
}
