'use client';

import type { EmailThreadSummary } from '@app/services/email.service';

import { formatAddressList } from '../helpers/format-address-list';
import { formatEmailDate } from '../helpers/format-email-date';

type ThreadListItemProps = {
  canMerge: boolean;
  isDragged: boolean;
  isMergeTarget: boolean;
  mailboxId: string;
  onDragCancel: () => void;
  onDragEnd: () => void;
  onDragMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onDragStart: (
    event: React.PointerEvent<HTMLButtonElement>,
    threadId: string,
  ) => void;
  thread: EmailThreadSummary;
  onSelect: (mailboxId: string, threadId: string) => void;
};

/** Renders a selectable mailbox thread and its drag-to-merge handle. */
export function ThreadListItem({
  canMerge,
  isDragged,
  isMergeTarget,
  mailboxId,
  onDragCancel,
  onDragEnd,
  onDragMove,
  onDragStart,
  thread,
  onSelect,
}: ThreadListItemProps) {
  return (
    <div
      className={`flex w-full items-start border-b border-slate-100 text-left transition last:border-b-0 dark:border-slate-800 ${
        isDragged ? 'opacity-50' : ''
      } ${
        isMergeTarget
          ? 'bg-emerald-100 ring-2 ring-inset ring-emerald-500 dark:bg-emerald-950/50'
          : 'hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20'
      } ${
        thread.hasUnreadMessages ? 'bg-amber-50/70 dark:bg-amber-950/20' : ''
      }`}
      data-thread-row={thread.id}
    >
      <button
        className="min-w-0 flex-1 px-5 py-5 text-left focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
        onClick={() => onSelect(mailboxId, thread.id)}
        type="button"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2.5">
            <p className="truncate text-base font-bold text-slate-950 dark:text-white">
              {formatAddressList(thread.participants)}
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
      {canMerge && (
        <button
          aria-label={`Merge ${thread.subject} into another thread`}
          className="mr-4 mt-4 cursor-grab touch-none select-none rounded-lg px-2 py-2 text-lg leading-none text-slate-400 hover:bg-white hover:text-emerald-700 active:cursor-grabbing dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-emerald-200"
          onPointerCancel={onDragCancel}
          onPointerDown={(event) => onDragStart(event, thread.id)}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          title="Drag onto another thread to merge"
          type="button"
        >
          ⠿
        </button>
      )}
    </div>
  );
}
