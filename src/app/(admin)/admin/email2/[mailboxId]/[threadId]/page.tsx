import Link from 'next/link';
import { notFound } from 'next/navigation';

import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { getCurrentUser } from '@app/hooks/get-user';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requirePermission } from '@app/services/access-verification.service';
import { logDevelopmentError } from '@app/services/development-error-logger.service';
import {
  EmailAddressSummary,
  EmailMessageSummary,
  emailService,
} from '@app/services/email.service';

import type { Metadata } from 'next';

type Email2ThreadPageProps = {
  params: Promise<{
    mailboxId: string;
    threadId: string;
  }>;
};

function formatAddress(address: EmailAddressSummary): string {
  return address.name !== undefined && address.name.length > 0
    ? `${address.name} <${address.address}>`
    : address.address;
}

function formatAddressList(addresses: EmailAddressSummary[]): string {
  if (addresses.length === 0) {
    return 'No recipients';
  }

  return addresses.map(formatAddress).join(', ');
}

function formatMessageDate(value: string): string {
  if (value.length === 0) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getMessageBody(message: EmailMessageSummary): string {
  return (
    message.content.text ??
    (message.content.html !== undefined
      ? message.content.html.replaceAll(/<[^>]+>/g, ' ')
      : '')
  );
}

export default async function Email2ThreadPage({
  params,
}: Email2ThreadPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return null;
  }

  await requirePermission(SYSTEM_PERMISSIONS.EMAIL_SEND);

  const { mailboxId, threadId } = await params;
  let thread;
  let messages;

  try {
    [thread, messages] = await Promise.all([
      emailService.getThread(threadId),
      emailService.listMessagesByThread(threadId),
    ]);
  } catch (error) {
    await logDevelopmentError('email2.threadPage.loadThreadMessages', error, {
      mailboxId,
      route: '/admin/email2/[mailboxId]/[threadId]',
      threadId,
      userId: currentUser.id.toString(),
    });

    throw error;
  }

  if (thread === null || thread.mailboxId !== mailboxId) {
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
        {messages.length > 0 ? (
          messages.map((message) => (
            <article
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
              key={message.id}
            >
              <header className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {message.subject}
                  </h2>

                  <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="grid gap-2 sm:grid-cols-[3rem_minmax(0,1fr)]">
                      <span className="text-slate-500 dark:text-slate-400">
                        From:
                      </span>
                      <span className="font-medium">
                        {formatAddress(message.from)}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[3rem_minmax(0,1fr)]">
                      <span className="text-slate-500 dark:text-slate-400">
                        To:
                      </span>
                      <span className="font-medium">
                        {formatAddressList(message.to)}
                      </span>
                    </div>
                    {message.cc.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-[3rem_minmax(0,1fr)]">
                        <span className="text-slate-500 dark:text-slate-400">
                          Cc:
                        </span>
                        <span className="font-medium">
                          {formatAddressList(message.cc)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {formatMessageDate(message.headerDate)}
                </span>
              </header>

              <div className="px-6 py-7">
                <p className="whitespace-pre-wrap text-base leading-7 text-slate-700 dark:text-slate-200">
                  {getMessageBody(message)}
                </p>

                {message.attachmentsCount > 0 && (
                  <div className="mt-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {message.attachmentsCount} Attachments
                  </div>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            No messages.
          </div>
        )}
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
