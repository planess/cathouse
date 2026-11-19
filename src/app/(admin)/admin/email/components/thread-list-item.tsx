'use client';

import { useLocale, useTranslations } from 'next-intl';
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
  const t = useTranslations('adminEmail');
  const locale = useLocale();
  const isUnread = thread.hasUnreadMessages;
  const rowStateClassName = isMergeTarget
    ? 'bg-emerald-100 ring-2 ring-inset ring-emerald-500 dark:bg-emerald-950/50'
    : isUnread
      ? 'bg-linear-to-r from-amber-100/90 via-amber-50/70 to-white hover:from-amber-200/80 hover:via-amber-100/70 dark:from-amber-900/40 dark:via-amber-950/25 dark:to-slate-950 dark:hover:from-amber-900/55'
      : 'hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20';

  return (
    <div
      className={`relative flex w-full items-start border-b border-slate-100 text-left transition last:border-b-0 dark:border-slate-800 ${
        isDragged ? 'opacity-50' : ''
      } ${rowStateClassName}`}
      data-thread-row={thread.id}
      data-unread={isUnread || undefined}
    >
      {isUnread && !isMergeTarget && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-amber-300 via-amber-500 to-yellow-600 shadow-[2px_0_10px_rgba(245,158,11,0.45)]"
        />
      )}
      <button
        className="min-w-0 flex-1 px-5 py-5 text-left focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
        onClick={() => onSelect(mailboxId, thread.id)}
        type="button"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2.5">
            <p className="flex min-w-0 items-center gap-2 text-base font-bold text-slate-950 dark:text-white">
              {isUnread && (
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500 ring-4 ring-amber-200/70 dark:bg-amber-400 dark:ring-amber-500/25"
                />
              )}
              <span className="truncate">
                {formatAddressList(
                  thread.participants,
                  t('thread.noParticipants'),
                )}
              </span>
              {isUnread && (
                <span className="sr-only">{t('threads.unread')}</span>
              )}
            </p>
            <h3
              className={`truncate text-sm ${
                isUnread
                  ? 'font-bold text-amber-950 dark:text-amber-100'
                  : 'font-medium text-slate-700 dark:text-slate-300'
              }`}
            >
              {thread.subject}
            </h3>
            {thread.preview.length > 0 && (
              <p className="line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {thread.preview}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-[10px] rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <span
                  className="inline-flex items-center gap-1"
                  title={t('threads.incoming', { count: thread.incomingCount })}
                >
                  <span aria-hidden="true">↓ {thread.incomingCount}</span>
                  <span className="sr-only">
                    {t('threads.incoming', { count: thread.incomingCount })}
                  </span>
                </span>
                <span
                  className="inline-flex items-center gap-1"
                  title={t('threads.outgoing', { count: thread.outgoingCount })}
                >
                  <span aria-hidden="true">↑ {thread.outgoingCount}</span>
                  <span className="sr-only">
                    {t('threads.outgoing', { count: thread.outgoingCount })}
                  </span>
                </span>
              </span>
              {thread.attachmentsCount > 0 && (
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {t('threads.attachments', {
                    count: thread.attachmentsCount,
                  })}
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {formatEmailDate(thread.lastMessageDate, locale)}
          </span>
        </div>
      </button>
      {canMerge && (
        <button
          aria-label={t('threads.mergeAria', { subject: thread.subject })}
          className="mr-4 mt-4 cursor-grab touch-none select-none rounded-lg px-2 py-2 text-lg leading-none text-slate-400 hover:bg-white hover:text-emerald-700 active:cursor-grabbing dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-emerald-200"
          onPointerCancel={onDragCancel}
          onPointerDown={(event) => onDragStart(event, thread.id)}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          title={t('threads.mergeHint')}
          type="button"
        >
          ⠿
        </button>
      )}
    </div>
  );
}
