import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requirePermission } from '@app/services/access-verification.service';

import { EmailMailboxPage } from '../components/email-mailbox-page';

import type { Metadata } from 'next';

export default async function NewEmailMailboxPage() {
  await requirePermission(SYSTEM_PERMISSIONS.EMAIL_SEND);

  return <EmailMailboxPage route="/admin/email/new" showCreateMailboxForm />;
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adminEmail'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('meta.title'), siteTitle),
  };
}
