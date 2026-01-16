import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import { MigrationManager } from '../components/migration-manager';

import type { Metadata } from 'next';

export default function AdminPage() {
  return <MigrationManager />;
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adminpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('migrations.title'), siteTitle),
  };
}
