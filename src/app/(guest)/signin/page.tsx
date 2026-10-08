import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import logoDark from '@public/assets/logo3_small-dark.svg';
import logo from '@public/assets/logo3_small.svg';

import AuthForm from './components/auth-form/auth-form';

import type { Metadata } from 'next';

export default function Signin() {
  const t = useTranslations('authorization');

  return (
    <div className="flex flex-col lg:flex-row lg:min-h-[720px] bg-[#f9f9f9] dark:bg-stone-800">
      <section className="flex flex-col gap-5 lg:gap-12 lg:justify-between lg:flex-none lg:w-[440px] xl:w-[520px] px-6 pt-6 pb-8 lg:px-12 xl:px-16 lg:py-12 bg-[#fbf7ef] dark:bg-stone-900 text-[#3e2940] dark:text-[#f3e9dc]">
        <h1 className="m-0 font-[Georgia,'Times_New_Roman',serif] font-normal text-[34px] leading-[38px] lg:text-[44px] lg:leading-[48px] xl:text-[56px] xl:leading-[58px]">
          {t('signin.tagline')}
        </h1>

        <p className="hidden lg:block m-0 max-w-[520px] text-[17px] leading-[27px] text-[#2b2731] dark:text-stone-300">
          {t('signin.description')}
        </p>
      </section>

      <div className="flex flex-col grow -mt-4 lg:mt-0 lg:items-center lg:gap-8 lg:flex-1 min-w-0 lg:px-6 lg:py-10">
        <div className="flex flex-col grow lg:justify-center w-full lg:max-w-[420px]">
          <AuthForm />
        </div>

        <p className="m-0 px-6 py-5 lg:p-0 text-center text-[13px] text-slate-500 dark:text-stone-400 bg-white dark:bg-stone-900 lg:bg-transparent lg:dark:bg-transparent">
          <Link
            href="/signup"
            className="text-sky-700 dark:text-sky-400 font-semibold hover:text-slate-900 dark:hover:text-stone-50"
          >
            {t('want-account-link')}
          </Link>
          {' · '}
          <Link
            href="/"
            className="text-slate-500 dark:text-stone-400 hover:text-slate-900 dark:hover:text-stone-50"
          >
            {t('signin.back-to-site')}
          </Link>
        </p>
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
    title: composeMetadataTitle(t('title.auth'), siteTitle),
  };
}
