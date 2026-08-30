'use client';

import type { EmailThreadSummary } from '@app/services/email.service';

import { ThreadListItem } from './thread-list-item';


type ThreadListProps = {
  mailboxId: string;
  threads: EmailThreadSummary[];
  onThreadSelect: (mailboxId: string, threadId: string) => void;
};

export function ThreadList({
  mailboxId,
  threads,
  onThreadSelect,
}: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <p className="px-5 py-8 text-sm text-slate-500 dark:text-slate-400">
        No threads.
      </p>
    );
  }

  return (
    <div>
      {threads.map((thread) => (
        <ThreadListItem
          key={thread.id}
          mailboxId={mailboxId}
          onSelect={onThreadSelect}
          thread={thread}
        />
      ))}
    </div>
  );
}
