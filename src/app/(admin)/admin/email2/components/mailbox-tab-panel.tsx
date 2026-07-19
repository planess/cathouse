'use client';

import type {
  EmailMailboxSummary,
  EmailThreadSummary,
} from '@app/services/email.service';

import { ThreadList } from './thread-list';


type MailboxTabPanelProps = {
  mailbox: EmailMailboxSummary;
  threads: EmailThreadSummary[];
  onCompose: (mailbox: EmailMailboxSummary) => void;
  onThreadSelect: (mailboxId: string, threadId: string) => void;
};

export function MailboxTabPanel({
  mailbox,
  threads,
  onCompose,
  onThreadSelect,
}: MailboxTabPanelProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
          {threads.length} Conversations
        </p>
        <button
          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          onClick={() => onCompose(mailbox)}
          type="button"
        >
          Create new email
        </button>
      </div>

      <ThreadList
        mailboxId={mailbox.id}
        onThreadSelect={onThreadSelect}
        threads={threads}
      />
    </div>
  );
}
