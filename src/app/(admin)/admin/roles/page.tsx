import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import { RoleManagement } from '../components/role-management/role-management';

import type { Metadata } from 'next';

export default function RolesPage() {
  return <RoleManagement />;
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adminpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('roles.title'), siteTitle),
  };
}
