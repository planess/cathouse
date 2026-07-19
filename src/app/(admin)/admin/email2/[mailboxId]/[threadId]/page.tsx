import Link from 'next/link';
import { notFound } from 'next/navigation';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import { ThreadMessageList } from '../../components/thread-message-list';
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-200"
          href={`/admin/email2/${mailboxId}`}
        >
          Back
        </Link>
        <p className="truncate text-lg font-semibold text-slate-600 dark:text-slate-300">
          {thread.subject}
        </p>
      </div>

      <section className="space-y-6">
        <ThreadMessageList messages={messages} />
      </section>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSiteTitle();

  return {
    title: composeMetadataTitle('Email2 Thread', siteTitle),
  };
}
