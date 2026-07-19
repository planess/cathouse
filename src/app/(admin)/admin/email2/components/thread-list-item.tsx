'use client';

import type { EmailThreadSummary } from '@app/services/email.service';

import { formatAddressList } from '../helpers/format-address-list';
import { formatEmailDate } from '../helpers/format-email-date';


type ThreadListItemProps = {
  mailboxId: string;
  thread: EmailThreadSummary;
  onSelect: (mailboxId: string, threadId: string) => void;
};

export function ThreadListItem({
  mailboxId,
  thread,
  onSelect,
}: ThreadListItemProps) {
  return (
    <button
      className="block w-full border-b border-slate-100 px-5 py-5 text-left transition last:border-b-0 hover:bg-emerald-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-slate-800 dark:hover:bg-emerald-950/20"
      onClick={() => onSelect(mailboxId, thread.id)}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2.5">
          <p className="truncate text-base font-bold text-slate-950 dark:text-white">
            Participants: {formatAddressList(thread.participants)}
          </p>
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {thread.subject}
          </h3>
          {thread.preview.length > 0 && (
            <p className="line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {thread.preview}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              {thread.messageCount} Messages
            </span>
            {thread.attachmentsCount > 0 && (
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {thread.attachmentsCount} Attachments
              </span>
            )}
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {formatEmailDate(thread.lastMessageDate)}
        </span>
      </div>
    </button>
  );
}
