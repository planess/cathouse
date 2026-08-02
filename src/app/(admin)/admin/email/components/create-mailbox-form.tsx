'use client';

import { FormEvent } from 'react';

import { EMAIL_MAILBOX_DOMAIN } from '../constants/email-mailbox-domain';
import { inputClassName } from '../constants/input-class-name';

import { StatusMessage } from './status-message';

import type { CreateMailboxResponse } from '../types/create-mailbox-response';

type CreateMailboxFormProps = {
  displayName: string;
  prefix: string;
  result: CreateMailboxResponse | null;
  saving: boolean;
  onDisplayNameChange: (value: string) => void;
  onPrefixChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function CreateMailboxForm({
  displayName,
  prefix,
  result,
  saving,
  onDisplayNameChange,
  onPrefixChange,
  onSubmit,
}: CreateMailboxFormProps) {
  return (
    <form
      className="space-y-4 px-5 pb-6 pt-5"
      onSubmit={(event) => void onSubmit(event)}
    >
      <div className="grid max-w-4xl gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <label
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            htmlFor="email-mailbox-display-name"
          >
            Sender name
          </label>
          <input
            className={inputClassName}
            id="email-mailbox-display-name"
            onChange={(event) => onDisplayNameChange(event.target.value)}
            placeholder="Periphery Foundation"
            type="text"
            value={displayName}
          />
        </div>

        <div>
          <label
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            htmlFor="email-mailbox-prefix"
          >
            Email prefix
          </label>
          <div className="flex items-center">
            <input
              className="min-w-0 flex-1 rounded-l-xl border border-r-0 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              id="email-mailbox-prefix"
              onChange={(event) => onPrefixChange(event.target.value)}
              placeholder="info"
              type="text"
              value={prefix}
            />
            <span className="shrink-0 rounded-r-xl border border-l-0 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              @{EMAIL_MAILBOX_DOMAIN}
            </span>
          </div>
        </div>
      </div>

      {result !== null && (
        <StatusMessage message={result.message} success={result.success} />
      )}

      <button
        className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={saving}
        type="submit"
      >
        Save
      </button>
    </form>
  );
}
