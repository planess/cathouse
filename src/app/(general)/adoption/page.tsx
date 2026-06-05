import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import { RedirectPlaceholder } from './components/redirect-placeholder';

import type { Metadata } from 'next';

export default function AdoptionPage() {
  return <RedirectPlaceholder href="/adoption/cat" />;
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adoptionpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('title'), siteTitle),
  };
}
