import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requireAnyPermission } from '@app/services/access-verification.service';

import { EmailMailboxPage } from '../components/email-mailbox-page';

import type { Metadata } from 'next';

type EmailMailboxPageProps = {
  params: Promise<{
    mailboxId: string;
  }>;
};

export default async function EmailMailboxRoutePage({
  params,
}: EmailMailboxPageProps) {
  const { mailboxId } = await params;

  await requireAnyPermission([
    SYSTEM_PERMISSIONS.EMAIL_READ,
    SYSTEM_PERMISSIONS.EMAIL_SEND,
  ]);

  return (
    <EmailMailboxPage
      route="/admin/email/[mailboxId]"
      selectedMailboxId={mailboxId}
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSiteTitle();

  return {
    title: composeMetadataTitle('Email', siteTitle),
  };
}
