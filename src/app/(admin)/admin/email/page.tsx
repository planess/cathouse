import { getTranslations } from 'next-intl/server';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requireAnyPermission } from '@app/services/access-verification.service';

import { EmailMailboxPage } from './components/email-mailbox-page';

import type { Metadata } from 'next';

export default async function EmailPage() {
  await requireAnyPermission([
    SYSTEM_PERMISSIONS.EMAIL_READ,
    SYSTEM_PERMISSIONS.EMAIL_SEND,
  ]);

  return <EmailMailboxPage route="/admin/email" />;
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
