'use client';

import { useState } from 'react';

import { sendFoundationEmail } from '../../../../actions/email.server';
import {
  EmailFormState,
  EmailRecipient,
  EmailViewProps,
} from '../types/email.types';

import { FileAttachments } from './file-attachments';
import { RecipientFields } from './recipient-fields';
import { RichTextEditor } from './rich-text-editor';

const SENDER_DOMAIN = 'perilines.com.ua';

const defaultFormState: EmailFormState = {
  recipients: [{ name: '', email: '' }],
  senderContext: 'info',
  subject: '',
  body: '',
};

export function EmailView({ userEmail: _userEmail }: EmailViewProps) {
  const [form, setForm] = useState<EmailFormState>(defaultFormState);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (field: keyof EmailFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setResult(null);
  };

  const handleRecipientsChange = (recipients: EmailRecipient[]) => {
    setForm((prev) => ({ ...prev, recipients }));
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);

    const formData = new FormData();
    formData.append(
      'recipients',
      JSON.stringify(form.recipients),
    );
    formData.append('senderContext', form.senderContext.trim() || 'info');
    formData.append('subject', form.subject);
    formData.append('body', form.body);

    for (const file of attachments) {
      formData.append('attachments', file);
    }

    const response = await sendFoundationEmail(formData);

    setSending(false);
    setResult(response);

    if (response.success) {
      setForm(defaultFormState);
      setAttachments([]);
    }
  };

  const hasValidRecipients = form.recipients.some((r) => r.email.trim());
  const isValid =
    hasValidRecipients &&
    form.subject.trim() !== '' &&
    form.body.trim() !== '' &&
    form.senderContext.trim() !== '';

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Email
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Send emails on behalf of the foundation.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <form className="space-y-5" onSubmit={(e) => void handleSubmit(e)}>
          {/* Sender context */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              htmlFor="sender-context"
            >
              Sender
            </label>
            <div className="flex items-center">
              <input
                className="w-40 rounded-l-xl border border-r-0 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                id="sender-context"
                onChange={(e) =>
                  handleChange(
                    'senderContext',
                    e.target.value.replaceAll(/[^\w.-]/g, ''),
                  )
                }
                placeholder="info"
                type="text"
                value={form.senderContext}
              />
              <span className="rounded-r-xl border border-l-0 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                @{SENDER_DOMAIN}
              </span>
            </div>
          </div>

          {/* Recipients */}
          <RecipientFields
            onChange={handleRecipientsChange}
            recipients={form.recipients}
          />

          {/* Subject */}
          <div>
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              htmlFor="email-subject"
            >
              Subject
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              id="email-subject"
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Email subject"
              required
              type="text"
              value={form.subject}
            />
          </div>

          {/* Rich text body */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Message
            </label>
            <RichTextEditor
              onChange={(html) => handleChange('body', html)}
            />
          </div>

          {/* File attachments */}
          <FileAttachments files={attachments} onChange={setAttachments} />

          {result && (
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium ${
                result.success
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
              }`}
            >
              {result.message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              className="rounded-xl bg-sky-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isValid || sending}
              type="submit"
            >
              {sending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
