'use client';

import { FormEvent } from 'react';

import type { EmailMailboxSummary } from '@app/services/email.service';

import { RichTextEditor } from '../../email/components/rich-text-editor';
import { inputClassName } from '../constants/input-class-name';
import { formatMailboxFrom } from '../helpers/format-mailbox-from';

import { StatusMessage } from './status-message';

import type { ComposeFormState } from '../types/compose-form-state';
import type { SendEmailResponse } from '../types/send-email-response';

type ComposeEmailModalProps = {
  form: ComposeFormState;
  mailbox: EmailMailboxSummary;
  result: SendEmailResponse | null;
  sending: boolean;
  onChange: (field: keyof ComposeFormState, value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function ComposeEmailModal({
  form,
  mailbox,
  result,
  sending,
  onChange,
  onClose,
  onSubmit,
}: ComposeEmailModalProps) {
  const mailboxFrom = formatMailboxFrom(mailbox);

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

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                htmlFor="compose-to"
              >
                To
              </label>
              <input
                className={inputClassName}
                id="compose-to"
                onChange={(event) => onChange('to', event.target.value)}
                placeholder="recipient@example.com"
                type="text"
                value={form.to}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                htmlFor="compose-cc"
              >
                Bc
              </label>
              <input
                className={inputClassName}
                id="compose-cc"
                onChange={(event) => onChange('cc', event.target.value)}
                placeholder="copy@example.com"
                type="text"
                value={form.cc}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                htmlFor="compose-bcc"
              >
                Bcc
              </label>
              <input
                className={inputClassName}
                id="compose-bcc"
                onChange={(event) => onChange('bcc', event.target.value)}
                placeholder="hidden@example.com"
                type="text"
                value={form.bcc}
              />
            </div>
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
