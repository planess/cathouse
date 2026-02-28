'use client';

import { EmailRecipient } from '../types/email.types';

interface RecipientFieldsProps {
  recipients: EmailRecipient[];
  onChange: (recipients: EmailRecipient[]) => void;
}

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500';

export function RecipientFields({
  recipients,
  onChange,
}: RecipientFieldsProps) {
  const updateRecipient = (
    index: number,
    field: keyof EmailRecipient,
    value: string,
  ) => {
    const updated = recipients.map((r, i) =>
      i === index ? { ...r, [field]: value } : r,
    );
    onChange(updated);
  };

  const addRecipient = () => {
    onChange([...recipients, { name: '', email: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length <= 1) {
      return;
    }
    onChange(recipients.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Recipients
        </label>
        <button
          className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          onClick={addRecipient}
          type="button"
        >
          + Add recipient
        </button>
      </div>

      {recipients.map((recipient, index) => (
        <div className="flex items-start gap-2" key={index}>
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              className={inputClassName}
              onChange={(e) => updateRecipient(index, 'name', e.target.value)}
              placeholder="Recipient name"
              type="text"
              value={recipient.name}
            />
            <input
              className={inputClassName}
              onChange={(e) => updateRecipient(index, 'email', e.target.value)}
              placeholder="recipient@example.com"
              required
              type="email"
              value={recipient.email}
            />
          </div>
          {recipients.length > 1 && (
            <button
              className="mt-2 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/30 dark:hover:text-rose-400"
              onClick={() => removeRecipient(index)}
              title="Remove recipient"
              type="button"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
