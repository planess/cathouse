'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

import type {
  EmailMessageSummary,
  EmailThreadSummary,
} from '@app/services/email.service';

import { formatAddressList } from '../helpers/format-address-list';
import { formatEmailDate } from '../helpers/format-email-date';
import { getInitialReplyForm } from '../helpers/get-initial-reply-form';
import { sendThreadReplyRequest } from '../helpers/send-thread-reply-request';

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
  const initialForm = useMemo(
    () => getInitialReplyForm(messages),
    [messages],
  );
  const [form, setForm] = useState<ThreadReplyFormState>(initialForm);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendEmailResponse | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const handleChange = (field: keyof ThreadReplyFormState, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setResult(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
          ...getInitialReplyForm(nextMessages),
          to: currentForm.to,
          cc: '',
          bcc: '',
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

  return (
    <div
      className="mx-auto max-w-4xl px-4 pb-1 md:px-8"
      data-email2-thread-conversation
    >
      <div>
        <header className="shrink-0 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <Link
                className="mb-4 inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-500/40"
                href={`/admin/email2/${mailboxId}`}
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
          data-email2-message-list
        >
          <ThreadMessageList messages={messages} />
        </div>

        <ThreadReplyForm
          attachments={attachments}
          editorKey={editorKey}
          form={form}
          result={result}
          sending={sending}
          onAttachmentsChange={setAttachments}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
