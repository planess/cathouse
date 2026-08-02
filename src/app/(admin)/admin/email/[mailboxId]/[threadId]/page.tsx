import { notFound } from 'next/navigation';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requirePermission } from '@app/services/access-verification.service';

import { ThreadConversation } from '../../components/thread-conversation';
import { loadEmailThreadPageData } from '../../helpers/load-email-thread-page-data';

import type { Metadata } from 'next';

type EmailThreadPageProps = {
  params: Promise<{
    mailboxId: string;
    threadId: string;
  }>;
};

export default async function EmailThreadPage({ params }: EmailThreadPageProps) {
  const { mailboxId, threadId } = await params;

  await requirePermission(SYSTEM_PERMISSIONS.EMAIL_SEND);

  const pageData = await loadEmailThreadPageData({ mailboxId, threadId });

  if (pageData === null) {
    return null;
  }

  const { messages, thread } = pageData;

  if (thread?.mailboxId !== mailboxId) {
    notFound();
  }

  return (
    <ThreadConversation
      initialMessages={messages}
      mailboxId={mailboxId}
      thread={thread}
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSiteTitle();

  return {
    title: composeMetadataTitle('Email', siteTitle),
  };
}
