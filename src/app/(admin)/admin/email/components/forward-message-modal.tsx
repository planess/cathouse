'use client';

import { FormEvent } from 'react';

import { inputClassName } from '../constants/input-class-name';

import { StatusMessage } from './status-message';

import type { SendEmailResponse } from '../types/send-email-response';

type ForwardMessageModalProps = {
  recipient: string;
  result: SendEmailResponse | null;
  sending: boolean;
  onClose: () => void;
  onRecipientChange: (recipient: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function ForwardMessageModal({
  recipient,
  result,
  sending,
  onClose,
  onRecipientChange,
  onSubmit,
}: ForwardMessageModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
    >
      <form
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        onSubmit={(event) => void onSubmit(event)}
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Forward message
          </h2>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              htmlFor="forward-recipient"
            >
              Recipient
            </label>
            <input
              autoFocus
              className={inputClassName}
              id="forward-recipient"
              onChange={(event) => onRecipientChange(event.target.value)}
              placeholder="recipient@example.com"
              required
              type="email"
              value={recipient}
            />
          </div>

          {result !== null && (
            <StatusMessage message={result.message} success={result.success} />
          )}
        </div>

        <footer className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
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
