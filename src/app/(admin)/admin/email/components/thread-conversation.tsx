'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

import type {
  EmailMessageSummary,
  EmailThreadSummary,
} from '@app/services/email.service';

import { formatAddressList } from '../helpers/format-address-list';
import { formatEmailDate } from '../helpers/format-email-date';
import { getInitialReplyForm } from '../helpers/get-initial-reply-form';
import { loadThreadMessagesRequest } from '../helpers/load-thread-messages-request';
import { markMessagesReadRequest } from '../helpers/mark-messages-read-request';
import { sendForwardMessageRequest } from '../helpers/send-forward-message-request';
import { sendThreadReplyRequest } from '../helpers/send-thread-reply-request';

import { ForwardMessageModal } from './forward-message-modal';
import { MailboxThreadSearch } from './mailbox-thread-search';
import { NavigationLoadingOverlay } from './navigation-loading-overlay';
import { ThreadMessageList } from './thread-message-list';
import { ThreadReplyForm } from './thread-reply-form';

import type { SendEmailResponse } from '../types/send-email-response';
import type { ThreadReplyFormState } from '../types/thread-reply-form-state';

type ThreadConversationProps = {
  canSend: boolean;
  mailboxId: string;
  initialMessages: EmailMessageSummary[];
  thread: EmailThreadSummary;
};

const THREAD_MESSAGES_REFRESH_INTERVAL_MS = 60_000;

export function ThreadConversation({
  canSend,
  mailboxId,
  initialMessages,
  thread,
}: ThreadConversationProps) {
  const router = useRouter();
  const t = useTranslations('adminEmail');
  const locale = useLocale();
  const [isNavigationPending, startNavigation] = useTransition();
  const [navigationLabel, setNavigationLabel] = useState<
    'opening' | 'returning'
  >('opening');
  const [messages, setMessages] = useState(initialMessages);
  const [form, setForm] = useState<ThreadReplyFormState | null>(null);
  const [isReplyExpanded, setIsReplyExpanded] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendEmailResponse | null>(null);
  const [forwardMessage, setForwardMessage] =
    useState<EmailMessageSummary | null>(null);
  const [forwardRecipient, setForwardRecipient] = useState('');
  const [forwardSending, setForwardSending] = useState(false);
  const [forwardResult, setForwardResult] = useState<SendEmailResponse | null>(
    null,
  );

  /** Message ids already sent to the read endpoint while this thread is open. */
  const reportedReadMessageIdsRef = useRef(new Set<string>());

  /**
   * Saves read states for the given messages in one request and marks the
   * saved ones as read locally. Ids already reported are skipped, so repeated
   * effects (for example React Strict Mode) do not send duplicates.
   */
  const reportMessagesRead = useCallback(async (messageIds: string[]) => {
    const reportedIds = reportedReadMessageIdsRef.current;
    const pendingIds = messageIds.filter((id) => !reportedIds.has(id));

    if (pendingIds.length === 0) {
      return;
    }

    pendingIds.forEach((id) => reportedIds.add(id));

    const markedIds = await markMessagesReadRequest(pendingIds).catch(
      () => null,
    );

    if (markedIds === null) {
      pendingIds.forEach((id) => reportedIds.delete(id));

      return;
    }

    const markedIdSet = new Set(markedIds);

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        markedIdSet.has(message.id) ? { ...message, isRead: true } : message,
      ),
    );
  }, []);

  useEffect(() => {
    // Opening the thread records every displayed incoming message: new read
    // states are created and existing ones get a fresh `lastReadAt`.
    void reportMessagesRead(
      initialMessages
        .filter((message) => message.direction === 'incoming')
        .map((message) => message.id),
    );
  }, [initialMessages, reportMessagesRead]);

  useEffect(() => {
    let isCurrent = true;
    let isRefreshing = false;
    let refreshController: AbortController | null = null;

    const refreshMessages = async () => {
      if (isRefreshing) {
        return;
      }

      isRefreshing = true;
      refreshController = new AbortController();

      try {
        const refreshedMessages = await loadThreadMessagesRequest(
          thread.id,
          refreshController.signal,
        );

        if (!isCurrent) {
          return;
        }

        setMessages((currentMessages) => {
          const refreshedMessageIds = new Set(
            refreshedMessages.map((message) => message.id),
          );

          return [
            ...refreshedMessages,
            ...currentMessages.filter(
              (message) => !refreshedMessageIds.has(message.id),
            ),
          ];
        });

        await reportMessagesRead(
          refreshedMessages
            .filter((message) => !message.isRead)
            .map((message) => message.id),
        );
      } catch {
        // Keep the current conversation visible and retry at the next interval.
      } finally {
        isRefreshing = false;
        refreshController = null;
      }
    };
    const intervalId = window.setInterval(() => {
      void refreshMessages();
    }, THREAD_MESSAGES_REFRESH_INTERVAL_MS);

    return () => {
      isCurrent = false;
      refreshController?.abort();
      window.clearInterval(intervalId);
    };
  }, [reportMessagesRead, thread.id]);

  const handleChange = (
    field: keyof ThreadReplyFormState,
    value: ThreadReplyFormState[keyof ThreadReplyFormState],
  ) => {
    setForm((currentForm) =>
      currentForm === null ? null : { ...currentForm, [field]: value },
    );
    setResult(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend || form === null) {
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await sendThreadReplyRequest(
        thread.id,
        mailboxId,
        form,
        attachments,
      );

      setResult(response.payload);

      if (response.ok && response.payload.success) {
        const nextMessages =
          response.payload.messageItem === undefined
            ? messages
            : [...messages, response.payload.messageItem];

        setMessages(nextMessages);
        setAttachments([]);
        setForm(null);
        setIsReplyExpanded(false);
        setResult(null);
      }
    } catch {
      setResult({
        success: false,
        message: t('common.sendFailed'),
      });
    } finally {
      setSending(false);
    }
  };

  const openReplyForm = () => {
    if (!canSend) {
      return;
    }

    setForm(getInitialReplyForm(messages, thread.participants));
    setIsReplyExpanded(true);
  };

  const closeReplyForm = () => {
    setIsReplyExpanded(false);
    setForm(null);
    setAttachments([]);
    setResult(null);
  };

  const handleBack = () => {
    setNavigationLabel('returning');
    startNavigation(() => {
      router.push(`/admin/email/${mailboxId}`);
    });
  };
  const handleSearchThreadSelect = (threadId: string) => {
    if (threadId === thread.id) {
      return;
    }

    setNavigationLabel('opening');
    startNavigation(() => {
      router.push(`/admin/email/${mailboxId}/${threadId}`);
    });
  };

  const closeForwardModal = () => {
    setForwardMessage(null);
    setForwardRecipient('');
    setForwardResult(null);
  };
  const handleForward = (message: EmailMessageSummary) => {
    if (!canSend) {
      return;
    }

    setForwardMessage(message);
    setForwardRecipient('');
    setForwardResult(null);
  };
  const handleForwardSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (forwardMessage === null) {
      return;
    }

    setForwardSending(true);
    setForwardResult(null);

    try {
      const response = await sendForwardMessageRequest(
        forwardMessage.id,
        mailboxId,
        forwardRecipient,
      );

      if (response.ok && response.payload.success) {
        if (response.payload.messageItem !== undefined) {
          setMessages((currentMessages) => [
            ...currentMessages,
            response.payload.messageItem as EmailMessageSummary,
          ]);
        }

        closeForwardModal();
      } else {
        setForwardResult(response.payload);
      }
    } catch {
      setForwardResult({
        success: false,
        message: t('thread.forwardFailed'),
      });
    } finally {
      setForwardSending(false);
    }
  };

  return (
    <div
      className="mx-auto max-w-4xl px-4 pb-1 md:px-8"
      data-email-thread-conversation
    >
      <div>
        <header className="shrink-0 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-500/40"
                  onClick={handleBack}
                  type="button"
                >
                  {t('common.back')}
                </button>
                <MailboxThreadSearch
                  currentThreadId={thread.id}
                  mailboxId={mailboxId}
                  onThreadSelect={handleSearchThreadSelect}
                />
              </div>
              <h1 className="truncate text-2xl font-bold text-slate-950 dark:text-white">
                {thread.subject}
              </h1>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                {formatAddressList(
                  thread.participants,
                  t('thread.noParticipants'),
                )}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {t('threads.messages', { count: messages.length })}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {formatEmailDate(thread.lastMessageDate, locale)}
              </span>
            </div>
          </div>
        </header>

        <div
          className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
          data-email-message-list
        >
          <ThreadMessageList messages={messages} onForward={handleForward} />
        </div>

        {canSend &&
          (isReplyExpanded && form !== null ? (
            <ThreadReplyForm
              attachments={attachments}
              form={form}
              result={result}
              sending={sending}
              onAttachmentsChange={setAttachments}
              onChange={handleChange}
              onCollapse={closeReplyForm}
              onSubmit={handleSubmit}
            />
          ) : (
            <button
              className="mt-4 flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-left text-sm font-medium text-slate-500 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
              onClick={openReplyForm}
              type="button"
            >
              <span aria-hidden="true">↩</span>
              {t('thread.reply')}
            </button>
          ))}

        {forwardMessage !== null && (
          <ForwardMessageModal
            onClose={closeForwardModal}
            onRecipientChange={(recipient) => {
              setForwardRecipient(recipient);
              setForwardResult(null);
            }}
            onSubmit={handleForwardSubmit}
            recipient={forwardRecipient}
            result={forwardResult}
            sending={forwardSending}
          />
        )}

        {isNavigationPending && (
          <NavigationLoadingOverlay label={t(`thread.${navigationLabel}`)} />
        )}
      </div>
    </div>
  );
}
