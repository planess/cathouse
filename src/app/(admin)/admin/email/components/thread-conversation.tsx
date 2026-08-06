'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

import type {
  EmailMessageSummary,
  EmailThreadSummary,
} from '@app/services/email.service';

import { formatAddressList } from '../helpers/format-address-list';
import { formatEmailDate } from '../helpers/format-email-date';
import { getInitialReplyForm } from '../helpers/get-initial-reply-form';
import { markThreadMessagesReadRequest } from '../helpers/mark-thread-messages-read-request';
import { sendForwardMessageRequest } from '../helpers/send-forward-message-request';
import { sendThreadReplyRequest } from '../helpers/send-thread-reply-request';

import { ForwardMessageModal } from './forward-message-modal';
import { ThreadMessageList } from './thread-message-list';
import { ThreadReplyForm } from './thread-reply-form';

import type { SendEmailResponse } from '../types/send-email-response';
import type { ThreadReplyFormState } from '../types/thread-reply-form-state';

type ThreadConversationProps = {
  mailboxId: string;
  initialMessages: EmailMessageSummary[];
  thread: EmailThreadSummary;
};

export function ThreadConversation({
  mailboxId,
  initialMessages,
  thread,
}: ThreadConversationProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [form, setForm] = useState<ThreadReplyFormState | null>(null);
  const [isReplyExpanded, setIsReplyExpanded] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendEmailResponse | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [forwardMessage, setForwardMessage] =
    useState<EmailMessageSummary | null>(null);
  const [forwardRecipient, setForwardRecipient] = useState('');
  const [forwardSending, setForwardSending] = useState(false);
  const [forwardResult, setForwardResult] = useState<SendEmailResponse | null>(
    null,
  );

  useEffect(() => {
    if (!initialMessages.some((message) => !message.isRead)) {
      return;
    }

    void markThreadMessagesReadRequest(thread.id).then((markedAsRead) => {
      if (!markedAsRead) {
        return;
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) => ({ ...message, isRead: true })),
      );
    });
  }, [initialMessages, thread.id]);

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
    if (form === null) {
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
        setForm((currentForm) => ({
          ...getInitialReplyForm(nextMessages, thread.participants),
          to: currentForm?.to ?? form.to,
          cc: [{ name: '', email: '' }],
          bcc: [{ name: '', email: '' }],
        }));
        setEditorKey((currentKey) => currentKey + 1);
      }
    } catch {
      setResult({
        success: false,
        message: 'Failed to send email.',
      });
    } finally {
      setSending(false);
    }
  };

  const openReplyForm = () => {
    setForm(getInitialReplyForm(messages, thread.participants));
    setIsReplyExpanded(true);
  };

  const closeReplyForm = () => {
    setIsReplyExpanded(false);
    setForm(null);
    setAttachments([]);
    setResult(null);
  };

  const closeForwardModal = () => {
    setForwardMessage(null);
    setForwardRecipient('');
    setForwardResult(null);
  };
  const handleForward = (message: EmailMessageSummary) => {
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
        message: 'Failed to forward email.',
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
              <Link
                className="mb-4 inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-500/40"
                href={`/admin/email/${mailboxId}`}
              >
                Back
              </Link>
              <h1 className="truncate text-2xl font-bold text-slate-950 dark:text-white">
                {thread.subject}
              </h1>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                {formatAddressList(thread.participants)}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {messages.length} Messages
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {formatEmailDate(thread.lastMessageDate)}
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

        {isReplyExpanded && form !== null ? (
          <ThreadReplyForm
            attachments={attachments}
            editorKey={editorKey}
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
            Reply to conversation
          </button>
        )}

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
      </div>
    </div>
  );
}
