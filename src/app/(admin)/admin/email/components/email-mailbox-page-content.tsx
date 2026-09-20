'use client';

import { useEffect, useState } from 'react';

import type { EmailMailboxThreadGroup } from '@app/services/email.service';

import { EmailContactsLink } from './email-contacts-link';
import { EmailMailboxTabs } from './mailbox-tabs';

type EmailMailboxPageContentProps = {
  canSend: boolean;
  mailboxGroups: EmailMailboxThreadGroup[];
  selectedMailboxId?: string;
  showCreateMailboxForm: boolean;
};

/** Renders the mailbox header, search control, and mailbox tabs. */
export function EmailMailboxPageContent({
  canSend,
  mailboxGroups,
  selectedMailboxId,
  showCreateMailboxForm,
}: EmailMailboxPageContentProps) {
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchText.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  return (
    <div
      className="mx-auto max-w-5xl space-y-6"
      data-email-search-query={searchQuery}
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Mailboxes
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View and reply to organization emails.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <input
            aria-label="Search emails in the selected mailbox"
            autoComplete="off"
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/30 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 md:w-72"
            onInput={(event) => setSearchText(event.currentTarget.value)}
            placeholder="Search emails..."
            type="search"
            value={searchText}
          />
          <EmailContactsLink />
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950 md:overflow-visible md:border-0 md:bg-transparent md:shadow-none">
        <EmailMailboxTabs
          mailboxGroups={mailboxGroups}
          canSend={canSend}
          searchQuery={searchQuery}
          selectedMailboxId={selectedMailboxId}
          showCreateMailboxForm={showCreateMailboxForm}
        />
      </section>
    </div>
  );
}
