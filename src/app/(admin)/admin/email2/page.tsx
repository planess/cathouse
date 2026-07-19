import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import { Email2MailboxPage } from './components/email2-mailbox-page';

import type { Metadata } from 'next';

export default async function Email2Page() {
  return <Email2MailboxPage route="/admin/email2" />;
}

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSiteTitle();

  return {
    title: composeMetadataTitle('Email2', siteTitle),
  };
}
