'use client';

import { KeyboardEvent, useEffect, useState } from 'react';

import type { EmailThreadSummary } from '@app/services/email.service';

import { formatAddressList } from '../helpers/format-address-list';
import { searchMailboxThreadsRequest } from '../helpers/search-mailbox-threads-request';

type MailboxThreadSearchProps = {
  currentThreadId: string;
  mailboxId: string;
  onThreadSelect: (threadId: string) => void;
};

/** Provides mailbox-scoped thread search on the conversation page. */
export function MailboxThreadSearch({
  currentThreadId,
  mailboxId,
  onThreadSelect,
}: MailboxThreadSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EmailThreadSummary[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length === 0) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);

      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    const timeoutId = window.setTimeout(() => {
      void searchMailboxThreadsRequest(
        mailboxId,
        normalizedQuery,
        controller.signal,
      )
        .then((threads) => {
          setResults(threads);
          setActiveResultIndex(0);
          setHasSearched(true);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setResults([]);
            setHasSearched(true);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [mailboxId, query]);

  const selectThread = (threadId: string) => {
    setIsOpen(false);
    onThreadSelect(threadId);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }

      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveResultIndex(
        (currentIndex) => (currentIndex + 1) % results.length,
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResultIndex(
        (currentIndex) =>
          (currentIndex - 1 + results.length) % results.length,
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      selectThread(results[activeResultIndex].id);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full sm:max-w-sm">
      <input
        aria-label="Search emails in this mailbox"
        aria-autocomplete="list"
        aria-controls="mailbox-thread-search-results"
        aria-expanded={isOpen && query.trim().length > 0}
        autoComplete="off"
        className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/30 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
        onBlur={() => window.setTimeout(() => setIsOpen(false), 100)}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search this mailbox..."
        type="search"
        value={query}
      />

      {isOpen && query.trim().length > 0 && (
        <div
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
          id="mailbox-thread-search-results"
          role="listbox"
        >
          {isLoading ? (
            <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              Searching...
            </p>
          ) : hasSearched && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              No matching emails.
            </p>
          ) : (
            results.map((thread, resultIndex) => (
              <button
                aria-selected={resultIndex === activeResultIndex}
                className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 dark:border-slate-800 ${
                  resultIndex === activeResultIndex
                    ? 'bg-emerald-50 dark:bg-emerald-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                key={thread.id}
                onClick={() => selectThread(thread.id)}
                onMouseDown={(event) => event.preventDefault()}
                onPointerDown={(event) => event.preventDefault()}
                role="option"
                type="button"
              >
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {thread.subject}
                  {thread.id === currentThreadId ? ' · Current' : ''}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">
                  {formatAddressList(thread.participants)}
                </span>
                {thread.preview.length > 0 && (
                  <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">
                    {thread.preview}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
