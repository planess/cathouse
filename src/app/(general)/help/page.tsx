import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import ProvideHelp from './components/section-provide-help/provide-help';
import ReceiveHelp from './components/section-receive-help/receive-help';

import type { Metadata } from 'next';

export default function Help() {
  const t = useTranslations('helppage');

  return (
    <div className="px-6 py-7">
      <h1 className="text-4xl font-bold text-center dark:text-stone-50 my-6 transition-colors">
        {t('title')}
      </h1>

      <div className="flex flex-col gap-4">
        <ProvideHelp />

        <ReceiveHelp />
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('helppage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
