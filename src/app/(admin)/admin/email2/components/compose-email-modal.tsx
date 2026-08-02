'use client';

import { ChangeEvent, FormEvent, useState } from 'react';

import type { EmailMailboxSummary } from '@app/services/email.service';

import { RichTextEditor } from '../../email/components/rich-text-editor';
import { inputClassName } from '../constants/input-class-name';
import { formatMailboxFrom } from '../helpers/format-mailbox-from';

import { RecipientFields } from './recipient-fields';
import { StatusMessage } from './status-message';

import type { ComposeFormState } from '../types/compose-form-state';
import type { SendEmailResponse } from '../types/send-email-response';

type ComposeEmailModalProps = {
  attachments: File[];
  form: ComposeFormState;
  mailbox: EmailMailboxSummary;
  result: SendEmailResponse | null;
  sending: boolean;
  onChange: (
    field: keyof ComposeFormState,
    value: ComposeFormState[keyof ComposeFormState],
  ) => void;
  onAttachmentsChange: (attachments: File[]) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function ComposeEmailModal({
  attachments,
  form,
  mailbox,
  result,
  sending,
  onChange,
  onAttachmentsChange,
  onClose,
  onSubmit,
}: ComposeEmailModalProps) {
  const mailboxFrom = formatMailboxFrom(mailbox);
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
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
    >
      <form
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        onSubmit={(event) => void onSubmit(event)}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              New email
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              From: {mailboxFrom}
            </p>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              htmlFor="compose-from"
            >
              From
            </label>
            <input
              className={inputClassName}
              id="compose-from"
              readOnly
              type="text"
              value={mailboxFrom}
            />
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            <div className="pb-4">
              <RecipientFields
                id="compose-to"
                label="To"
                onChange={(recipients) => onChange('to', recipients)}
                recipients={form.to}
                required
              />
              <button
                aria-controls="compose-copy-fields"
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
              <div className="space-y-4 py-4" id="compose-copy-fields">
                <RecipientFields
                  id="compose-cc"
                  label="Cc"
                  onChange={(recipients) => onChange('cc', recipients)}
                  recipients={form.cc}
                />
                <RecipientFields
                  id="compose-bcc"
                  label="Bcc"
                  onChange={(recipients) => onChange('bcc', recipients)}
                  recipients={form.bcc}
                />
              </div>
            )}
          </div>

          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              htmlFor="compose-subject"
            >
              Subject
            </label>
            <input
              className={inputClassName}
              id="compose-subject"
              onChange={(event) => onChange('subject', event.target.value)}
              placeholder="Email subject"
              type="text"
              value={form.subject}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Content
            </label>
            <RichTextEditor onChange={(html) => onChange('bodyHtml', html)} />
          </div>

          <div>
            <label className="relative inline-flex cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Attach files
              <input
                className="absolute inset-0 cursor-pointer opacity-0"
                multiple
                onChange={handleAddAttachments}
                type="file"
              />
            </label>

            {attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
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
          </div>

          {result !== null && (
            <StatusMessage message={result.message} success={result.success} />
          )}
        </div>

        <footer className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={sending}
            type="submit"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </footer>
      </form>
    </div>
  );
}
