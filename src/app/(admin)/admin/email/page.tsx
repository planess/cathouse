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
  const siteTitle = await getSiteTitle();

  return {
    title: composeMetadataTitle('Email', siteTitle),
  };
}
