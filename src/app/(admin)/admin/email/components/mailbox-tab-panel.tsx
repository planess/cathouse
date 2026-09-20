'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { AdminAdminEmailComponentsMailboxTabPanelIcon01 } from '@app/components/icons/admin-admin-email-components-mailbox-tab-panel-icon-01';
import type {
  EmailMailboxSummary,
  EmailThreadSummary,
} from '@app/services/email.service';

import { PAGE_THREAD_SIZE } from '../constants/page-thread-size';
import { mergeMailboxThreadsRequest } from '../helpers/merge-mailbox-threads-request';

import { ThreadList } from './thread-list';

type MailboxTabPanelProps = {
  canSend: boolean;
  mailbox: EmailMailboxSummary;
  refreshToken: number;
  onCompose: (mailbox: EmailMailboxSummary) => void;
  onThreadSelect: (mailboxId: string, threadId: string) => void;
};

type ThreadPageResponse = {
  items?: EmailThreadSummary[];
  totalItems?: number;
};

const threadPageRequests = new Map<string, Promise<ThreadPageResponse>>();
const THREAD_LIST_REFRESH_INTERVAL_MS = 60_000;

function loadThreadPage(mailboxId: string, page: number, forceRefresh = false) {
  const key = `${mailboxId}:${page}`;
  const existingRequest = threadPageRequests.get(key);

  if (!forceRefresh && existingRequest !== undefined) {
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
  refreshToken,
  onCompose,
  onThreadSelect,
}: MailboxTabPanelProps) {
  const [pageThreads, setPageThreads] = useState<EmailThreadSummary[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeMessage, setMergeMessage] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRequestedRef = useRef(false);
  const loadedMailboxIdRef = useRef(mailbox.id);
  const loadedPageCountRef = useRef(0);
  const refreshRequestedRef = useRef(false);
  const previousRefreshTokenRef = useRef(refreshToken);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      refreshRequestedRef.current = true;
      setRefreshCount((currentCount) => currentCount + 1);
    }, THREAD_LIST_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [mailbox.id]);

  useEffect(() => {
    let isCurrent = true;
    const mailboxChanged = loadedMailboxIdRef.current !== mailbox.id;
    const forceRefresh =
      refreshRequestedRef.current ||
      previousRefreshTokenRef.current !== refreshToken;
    const loadedPageCount = mailboxChanged
      ? 1
      : Math.max(1, loadedPageCountRef.current);

    loadedMailboxIdRef.current = mailbox.id;
    refreshRequestedRef.current = false;
    previousRefreshTokenRef.current = refreshToken;

    if (mailboxChanged) {
      loadMoreRequestedRef.current = false;
      loadedPageCountRef.current = 0;
      setIsLoadingMore(false);
      setPageThreads([]);
      setTotalItems(0);
    }

    setIsLoading(true);

    void Promise.all(
      Array.from({ length: loadedPageCount }, (_, index) =>
        loadThreadPage(mailbox.id, index + 1, forceRefresh),
      ),
    )
      .then((payloads) => {
        if (!isCurrent) {
          return;
        }

        const uniqueThreads = new Map<string, EmailThreadSummary>();

        payloads.forEach((payload) => {
          payload.items?.forEach((thread) => {
            uniqueThreads.set(thread.id, thread);
          });
        });

        loadedPageCountRef.current = loadedPageCount;
        setPageThreads([...uniqueThreads.values()]);
        setTotalItems(payloads[0]?.totalItems ?? 0);
      })
      .catch(() => { /* return undefined */ })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [mailbox.id, refreshCount, refreshToken]);

  const loadNextThreadPage = useCallback(async () => {
    if (
      loadMoreRequestedRef.current ||
      isLoading ||
      pageThreads.length >= totalItems
    ) {
      return;
    }

    const requestedMailboxId = mailbox.id;
    const nextPage = loadedPageCountRef.current + 1;

    loadMoreRequestedRef.current = true;
    setIsLoadingMore(true);

    try {
      const payload = await loadThreadPage(requestedMailboxId, nextPage);

      if (loadedMailboxIdRef.current !== requestedMailboxId) {
        return;
      }

      loadedPageCountRef.current = nextPage;
      setPageThreads((currentThreads) => {
        const uniqueThreads = new Map(
          currentThreads.map((thread) => [thread.id, thread]),
        );

        payload.items?.forEach((thread) => {
          uniqueThreads.set(thread.id, thread);
        });

        return [...uniqueThreads.values()];
      });
      setTotalItems(payload.totalItems ?? 0);
    } catch {
      // Keep the sentinel available so scrolling can retry the request.
    } finally {
      loadMoreRequestedRef.current = false;

      if (loadedMailboxIdRef.current === requestedMailboxId) {
        setIsLoadingMore(false);
      }
    }
  }, [isLoading, mailbox.id, pageThreads.length, totalItems]);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;

    if (
      sentinel === null ||
      isLoading ||
      isLoadingMore ||
      pageThreads.length >= totalItems
    ) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        void loadNextThreadPage();
      }
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [
    isLoading,
    isLoadingMore,
    loadNextThreadPage,
    pageThreads.length,
    totalItems,
  ]);

  const handleThreadMerge = async (
    sourceThreadId: string,
    targetThreadId: string,
  ) => {
    if (!canSend || isMerging) {
      return;
    }

    setIsMerging(true);
    setMergeMessage('');

    try {
      const { ok, payload } = await mergeMailboxThreadsRequest(
        mailbox.id,
        sourceThreadId,
        targetThreadId,
      );

      if (!ok || !payload.success) {
        throw new Error(payload.message);
      }

      setPageThreads((currentThreads) =>
        currentThreads.filter((thread) => thread.id !== sourceThreadId),
      );
      setTotalItems((currentTotal) => Math.max(0, currentTotal - 1));
      setMergeMessage('Threads merged.');
      refreshRequestedRef.current = true;
      setRefreshCount((currentCount) => currentCount + 1);
    } catch (error) {
      setMergeMessage(
        error instanceof Error ? error.message : 'Failed to merge threads.',
      );
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
          {totalItems} Conversations
        </p>
        <div className="flex items-center gap-2">
          <button
            aria-label="Refresh threads"
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            disabled={isLoading}
            onClick={() => {
              refreshRequestedRef.current = true;
              setRefreshCount((currentCount) => currentCount + 1);
            }}
            title="Refresh threads"
            type="button"
          >
            <AdminAdminEmailComponentsMailboxTabPanelIcon01
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            />
          </button>
          {canSend && (
            <>
              <button
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                onClick={() => onCompose(mailbox)}
                type="button"
              >
                Create new email
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative min-h-36">
        <ThreadList
          canMerge={canSend && !isMerging}
          mailboxId={mailbox.id}
          onThreadMerge={(sourceThreadId, targetThreadId) =>
            void handleThreadMerge(sourceThreadId, targetThreadId)
          }
          onThreadSelect={onThreadSelect}
          threads={pageThreads}
        />
        {mergeMessage.length > 0 && (
          <p
            aria-live="polite"
            className={`px-5 py-2 text-sm ${
              mergeMessage === 'Threads merged.'
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-red-700 dark:text-red-300'
            }`}
            role="status"
          >
            {mergeMessage}
          </p>
        )}
        <div aria-hidden="true" className="h-px" ref={loadMoreSentinelRef} />
        {isLoadingMore && (
          <div className="flex justify-center px-5 py-4">
            <span
              aria-label="Loading more threads"
              className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400"
              role="status"
            />
          </div>
        )}
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
