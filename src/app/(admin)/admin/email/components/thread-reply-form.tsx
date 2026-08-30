'use client';

import { ChangeEvent, FormEvent, useState } from 'react';

import { RecipientFields } from './email-recipient-fields';
import { RichTextEditor } from './rich-text-editor';
import { StatusMessage } from './status-message';

import type { SendEmailResponse } from '../types/send-email-response';
import type { ThreadReplyFormState } from '../types/thread-reply-form-state';

type ThreadReplyFormProps = {
  attachments: File[];
  form: ThreadReplyFormState;
  result: SendEmailResponse | null;
  sending: boolean;
  onAttachmentsChange: (attachments: File[]) => void;
  onCollapse: () => void;
  onChange: (
    field: keyof ThreadReplyFormState,
    value: ThreadReplyFormState[keyof ThreadReplyFormState],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function ThreadReplyForm({
  attachments,
  form,
  result,
  sending,
  onAttachmentsChange,
  onCollapse,
  onChange,
  onSubmit,
}: ThreadReplyFormProps) {
  const [showCopyFields, setShowCopyFields] = useState(
    () =>
      form.cc.some(
        (recipient) =>
          recipient.name.trim().length > 0 || recipient.email.trim().length > 0,
      ) ||
      form.bcc.some(
        (recipient) =>
          recipient.name.trim().length > 0 || recipient.email.trim().length > 0,
      ),
  );
  const canSend =
    form.to.some((recipient) => recipient.email.trim().length > 0) &&
    form.bodyHtml.trim().length > 0;
  const handleAddAttachments = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;

    if (selectedFiles === null) {
      return;
    }

    onAttachmentsChange([...attachments, ...selectedFiles]);
    event.target.value = '';
  };
  const handleRemoveAttachment = (index: number) => {
    onAttachmentsChange(
      attachments.filter(
        (_attachment, attachmentIndex) => attachmentIndex !== index,
      ),
    );
  };

  return (
    <section
      className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950"
      data-email-reply-form
    >
      <button
        className="flex w-full items-center gap-2 border-b border-slate-200 bg-slate-50/70 px-5 py-2.5 text-left text-sm font-medium text-slate-500 transition hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:text-emerald-300"
        onClick={onCollapse}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
          <path d="M9 14 4 9l5-5" />
        </svg>
        <span>Reply to conversation</span>
      </button>

      <form onSubmit={(event) => void onSubmit(event)}>
        <div className="space-y-3 p-4">
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            <div className="pb-3">
              <RecipientFields
                id="thread-reply-to"
                label="To"
                onChange={(recipients) => onChange('to', recipients)}
                recipients={form.to}
                required
              />
              <button
                aria-controls="thread-reply-copy-fields"
                aria-expanded={showCopyFields}
                className="mt-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                onClick={() => setShowCopyFields((visible) => !visible)}
                type="button"
              >
                {showCopyFields ? 'Hide Cc and Bcc' : 'Cc and Bcc'}
                <svg
                  aria-hidden="true"
                  className={`h-4 w-4 transition-transform ${
                    showCopyFields ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
            {showCopyFields && (
              <div className="space-y-3 py-3" id="thread-reply-copy-fields">
                <RecipientFields
                  id="thread-reply-cc"
                  label="Cc"
                  onChange={(recipients) => onChange('cc', recipients)}
                  recipients={form.cc}
                />
                <RecipientFields
                  id="thread-reply-bcc"
                  label="Bcc"
                  onChange={(recipients) => onChange('bcc', recipients)}
                  recipients={form.bcc}
                />
              </div>
            )}
          </div>

          <div>
            <label
              className="mb-1.5 block text-[0.68rem] font-semibold uppercase text-slate-500 dark:text-slate-400"
              htmlFor="thread-reply-body"
            >
              Body
            </label>
            <div id="thread-reply-body">
              <RichTextEditor
                editorClassName="prose prose-sm dark:prose-invert max-w-none min-h-60 px-4 py-3 focus:outline-none [&_blockquote]:my-4 [&_blockquote]:ml-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:bg-slate-50 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-sm [&_blockquote]:text-slate-600 [&_blockquote_blockquote]:border-slate-400 dark:[&_blockquote]:border-slate-600 dark:[&_blockquote]:bg-slate-900 dark:[&_blockquote]:text-slate-300 dark:[&_blockquote_blockquote]:border-slate-500"
                initialContent={form.bodyHtml}
                onChange={(html) => onChange('bodyHtml', html)}
              />
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <button
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
                  key={`${attachment.name}-${attachment.size}-${index}`}
                  onClick={() => handleRemoveAttachment(index)}
                  type="button"
                >
                  {attachment.name}
                </button>
              ))}
            </div>
          )}

          {result !== null && (
            <StatusMessage message={result.message} success={result.success} />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-900/30">
          <label className="relative cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-500/40">
            Attach Files
            <input
              className="absolute inset-0 cursor-pointer opacity-0"
              multiple
              onChange={handleAddAttachments}
              type="file"
            />
          </label>
          <button
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
            disabled={!canSend || sending}
            type="submit"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </section>
  );
}
