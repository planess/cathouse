'use client';

import { FormEvent } from 'react';

import type { EmailMailboxSummary } from '@app/services/email.service';

import { inputClassName } from '../constants/input-class-name';

import { StatusMessage } from './status-message';

type EditMailboxDisplayNameModalProps = {
  displayName: string;
  mailbox: EmailMailboxSummary;
  result: { success: boolean; message: string } | null;
  saving: boolean;
  onClose: () => void;
  onDisplayNameChange: (displayName: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function EditMailboxDisplayNameModal({
  displayName,
  mailbox,
  result,
  saving,
  onClose,
  onDisplayNameChange,
  onSubmit,
}: EditMailboxDisplayNameModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="dialog"
    >
      <form
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        onSubmit={(event) => void onSubmit(event)}
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Edit sender name
          </h2>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>

        <div className="space-y-4 px-6 py-5">
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            Sender mailbox:{' '}
            <span className="font-semibold">{mailbox.address}</span>
          </p>
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              htmlFor="mailbox-display-name"
            >
              Sender name
            </label>
            <input
              className={inputClassName}
              id="mailbox-display-name"
              onChange={(event) => onDisplayNameChange(event.target.value)}
              type="text"
              value={displayName}
            />
          </div>
          {result !== null && (
            <StatusMessage message={result.message} success={result.success} />
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </footer>
      </form>
    </div>
  );
}
