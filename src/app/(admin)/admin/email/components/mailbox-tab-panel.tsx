'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import type {
  EmailMailboxSummary,
  EmailThreadSummary,
} from '@app/services/email.service';

import { PAGE_THREAD_SIZE } from '../constants/page-thread-size';

import { Pagination } from './pagination';
import { ThreadList } from './thread-list';

type MailboxTabPanelProps = {
  canSend: boolean;
  mailbox: EmailMailboxSummary;
  onCompose: (mailbox: EmailMailboxSummary) => void;
  onEditMailbox: (mailbox: EmailMailboxSummary) => void;
  onThreadSelect: (mailboxId: string, threadId: string) => void;
};

type ThreadPageResponse = {
  items?: EmailThreadSummary[];
  totalItems?: number;
};

const threadPageRequests = new Map<string, Promise<ThreadPageResponse>>();

function loadThreadPage(mailboxId: string, page: number) {
  const key = `${mailboxId}:${page}`;
  const existingRequest = threadPageRequests.get(key);

  if (existingRequest !== undefined) {
    return existingRequest;
  }

  const request = fetch(
    `/api/admin/email/mailboxes/${mailboxId}/threads?page=${page}&pageSize=${PAGE_THREAD_SIZE}`,
  )
    .then((response) => response.json() as Promise<ThreadPageResponse>)
    .catch((error: unknown) => {
      threadPageRequests.delete(key);
      throw error;
    });

  threadPageRequests.set(key, request);

  return request;
}

export function MailboxTabPanel({
  canSend,
  mailbox,
  onCompose,
  onEditMailbox,
  onThreadSelect,
}: MailboxTabPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPage = Number(searchParams.get('page') ?? '1');
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;
  const [pageThreads, setPageThreads] = useState<EmailThreadSummary[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    void loadThreadPage(mailbox.id, currentPage)
      .then((payload) => {
        if (!isCurrent) {
          return;
        }

        setPageThreads(payload.items ?? []);
        setTotalItems(payload.totalItems ?? 0);
      })
      .catch(() => undefined)
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [currentPage, mailbox.id]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    params.set('pageSize', PAGE_THREAD_SIZE.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
          {totalItems} Conversations
        </p>
        {canSend && <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            onClick={() => onEditMailbox(mailbox)}
            type="button"
          >
            Edit sender name
          </button>
          <button
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            onClick={() => onCompose(mailbox)}
            type="button"
          >
            Create new email
          </button>
        </div>}
      </div>

      <div className="relative min-h-36">
        <ThreadList
          mailboxId={mailbox.id}
          onThreadSelect={onThreadSelect}
          threads={pageThreads}
        />
        <Pagination
          currentPage={currentPage}
          pageSize={PAGE_THREAD_SIZE}
          onPageChange={handlePageChange}
          totalItems={totalItems}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[1px] dark:bg-slate-950/75">
            <span
              aria-label="Loading threads"
              className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400"
              role="status"
            />
          </div>
        )}
      </div>
    </div>
  );
}
