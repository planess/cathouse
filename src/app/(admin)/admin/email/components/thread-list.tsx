'use client';

import { PointerEvent, useCallback, useEffect, useRef, useState } from 'react';

import type { EmailThreadSummary } from '@app/services/email.service';

import { ThreadListItem } from './thread-list-item';

type ThreadListProps = {
  canMerge: boolean;
  mailboxId: string;
  onThreadMerge: (sourceThreadId: string, targetThreadId: string) => void;
  threads: EmailThreadSummary[];
  onThreadSelect: (mailboxId: string, threadId: string) => void;
};

/** Renders mailbox threads and coordinates drag-to-merge interactions. */
export function ThreadList({
  canMerge,
  mailboxId,
  onThreadMerge,
  threads,
  onThreadSelect,
}: ThreadListProps) {
  const [draggedThreadId, setDraggedThreadId] = useState<string | null>(null);
  const [targetThreadId, setTargetThreadId] = useState<string | null>(null);
  const draggedThreadIdRef = useRef<string | null>(null);
  const targetThreadIdRef = useRef<string | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (longPressTimerRef.current !== null) {
        clearTimeout(longPressTimerRef.current);
      }
    },
    [],
  );

  const activateDrag = useCallback((threadId: string) => {
    draggedThreadIdRef.current = threadId;
    setDraggedThreadId(threadId);
  }, []);

  const clearDrag = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    draggedThreadIdRef.current = null;
    targetThreadIdRef.current = null;
    setDraggedThreadId(null);
    setTargetThreadId(null);
  }, []);

  const handleDragStart = useCallback(
    (event: PointerEvent<HTMLButtonElement>, threadId: string) => {
      event.currentTarget.setPointerCapture(event.pointerId);

      if (event.pointerType === 'touch') {
        longPressTimerRef.current = setTimeout(
          () => activateDrag(threadId),
          350,
        );
      } else {
        activateDrag(threadId);
      }
    },
    [activateDrag],
  );

  const handleDragMove = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const sourceThreadId = draggedThreadIdRef.current;

      if (sourceThreadId === null) {
        return;
      }

      const rows = Array.from(
        event.currentTarget
          .closest('[data-thread-list]')
          ?.querySelectorAll<HTMLElement>('[data-thread-row]') ?? [],
      );
      const targetRow = rows.find((row) => {
        const bounds = row.getBoundingClientRect();

        return event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      });
      const nextTargetThreadId = targetRow?.dataset.threadRow;
      const validTargetThreadId =
        nextTargetThreadId === undefined ||
        nextTargetThreadId === sourceThreadId
          ? null
          : nextTargetThreadId;

      targetThreadIdRef.current = validTargetThreadId;
      setTargetThreadId(validTargetThreadId);
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    const sourceThreadId = draggedThreadIdRef.current;
    const mergeTargetThreadId = targetThreadIdRef.current;

    clearDrag();

    if (sourceThreadId !== null && mergeTargetThreadId !== null) {
      onThreadMerge(sourceThreadId, mergeTargetThreadId);
    }
  }, [clearDrag, onThreadMerge]);

  if (threads.length === 0) {
    return (
      <p className="px-5 py-8 text-sm text-slate-500 dark:text-slate-400">
        No threads.
      </p>
    );
  }

  const sortedThreads = [...threads].sort(
    (a, b) =>
      Date.parse(b.updatedAt) - Date.parse(a.updatedAt) ||
      b.id.localeCompare(a.id),
  );

  return (
    <div data-thread-list>
      {sortedThreads.map((thread) => (
        <ThreadListItem
          canMerge={canMerge && sortedThreads.length > 1}
          isDragged={thread.id === draggedThreadId}
          isMergeTarget={thread.id === targetThreadId}
          key={thread.id}
          mailboxId={mailboxId}
          onDragCancel={clearDrag}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
          onDragStart={handleDragStart}
          onSelect={onThreadSelect}
          thread={thread}
        />
      ))}
    </div>
  );
}
