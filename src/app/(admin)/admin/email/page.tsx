import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requirePermission } from '@app/services/access-verification.service';

import { EmailView } from './components/email-view';

import type { Metadata } from 'next';

export default async function EmailPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return null;
  }

  await requirePermission(SYSTEM_PERMISSIONS.EMAIL_SEND);

  return <EmailView userEmail={currentUser.email} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adminpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('foundationEmail.title'), siteTitle),
  };
}
