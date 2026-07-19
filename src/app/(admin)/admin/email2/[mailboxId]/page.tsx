import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import { Email2MailboxPage as Email2MailboxPageContent } from '../components/email2-mailbox-page';

import type { Metadata } from 'next';

type Email2MailboxPageProps = {
  params: Promise<{
    mailboxId: string;
  }>;
};

export default async function Email2MailboxPage({
  params,
}: Email2MailboxPageProps) {
  const { mailboxId } = await params;

  return (
    <Email2MailboxPageContent
      route="/admin/email2/[mailboxId]"
      selectedMailboxId={mailboxId}
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSiteTitle();

  return {
    title: composeMetadataTitle('Email2', siteTitle),
  };
}
