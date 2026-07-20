import { notFound } from 'next/navigation';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import { ThreadConversation } from '../../components/thread-conversation';
import { loadEmailThreadPageData } from '../../helpers/load-email-thread-page-data';

import type { Metadata } from 'next';

type Email2ThreadPageProps = {
  params: Promise<{
    mailboxId: string;
    threadId: string;
  }>;
};

export default async function Email2ThreadPage({
  params,
}: Email2ThreadPageProps) {
  const { mailboxId, threadId } = await params;
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
    title: composeMetadataTitle('Email2 Thread', siteTitle),
  };
}
