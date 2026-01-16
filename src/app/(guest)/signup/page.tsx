import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import RegisterForm from './components/register-form/register-form';

import type { Metadata } from 'next';

export default function Signup() {
  const t = useTranslations('authorization');

  return (
    <div className="px-6 py-7">
      <h1 className="text-3xl text-center mb-5">{t('title.register')}</h1>

      <div className="mb-3">
        <div className="text-center mb-3 -mx-6 p-3 bg-amber-50 border border-amber-100 text-lime-900">
          {t('notice.chooseDirection')}
        </div>

        <div className="lg:w-120 mx-auto">
          <RegisterForm />
        </div>
      </div>

      <div className="lg:w-120 mx-auto flex justify-end mt-9">
        <Link className="text-sky-600 hover:underline" href="/signin">
          {t('already-have-account-link')}
        </Link>
      </div>
    </div>
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
