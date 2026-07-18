'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { Tabs, TabItem } from '@app/components/tabs';
import type {
  EmailAddressSummary,
  EmailMailboxSummary,
  EmailMailboxThreadGroup,
  EmailThreadSummary,
} from '@app/services/email.service';

import { RichTextEditor } from '../../email/components/rich-text-editor';

const CREATE_TAB_ID = 'create-mailbox';
const MAILBOX_DOMAIN = 'perilines.com.ua';
const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500';

type CreateMailboxResponse = {
  success: boolean;
  message: string;
  group?: EmailMailboxThreadGroup;
};

type SendEmailResponse = {
  success: boolean;
  message: string;
  thread?: EmailThreadSummary;
};

type ComposeFormState = {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  bodyHtml: string;
};

const defaultComposeForm: ComposeFormState = {
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  bodyHtml: '',
};

type Email2MailboxTabsProps = {
  mailboxGroups: EmailMailboxThreadGroup[];
  selectedMailboxId?: string;
};

function formatAddress(address: EmailAddressSummary): string {
  return address.name !== undefined && address.name.length > 0
    ? `${address.name} <${address.address}>`
    : address.address;
}

function formatAddressList(addresses: EmailAddressSummary[]): string {
  if (addresses.length === 0) {
    return 'No participants';
  }

  return addresses.map(formatAddress).join(', ');
}

function formatThreadDate(value: string): string {
  if (value.length === 0) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatMailboxFrom(mailbox: EmailMailboxSummary): string {
  return mailbox.displayName !== mailbox.address
    ? `${mailbox.displayName} <${mailbox.address}>`
    : mailbox.address;
}

export function Email2MailboxTabs({
  mailboxGroups,
  selectedMailboxId,
}: Email2MailboxTabsProps) {
  const router = useRouter();
  const [groups, setGroups] = useState(mailboxGroups);
  const getInitialActiveId = useCallback(
    (currentGroups: EmailMailboxThreadGroup[]) => {
      const selectedMailbox = currentGroups.find(
        (group) => group.mailbox.id === selectedMailboxId,
      );

      if (selectedMailbox !== undefined) {
        return `mailbox-${selectedMailbox.mailbox.id}`;
      }

      return currentGroups.length > 0
        ? `mailbox-${currentGroups[0].mailbox.id}`
        : CREATE_TAB_ID;
    },
    [selectedMailboxId],
  );
  const [activeId, setActiveId] = useState(() =>
    getInitialActiveId(mailboxGroups),
  );
  const [prefix, setPrefix] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<CreateMailboxResponse | null>(null);
  const [composeMailbox, setComposeMailbox] =
    useState<EmailMailboxSummary | null>(null);
  const [composeForm, setComposeForm] =
    useState<ComposeFormState>(defaultComposeForm);
  const [composeSending, setComposeSending] = useState(false);
  const [composeResult, setComposeResult] =
    useState<SendEmailResponse | null>(null);

  useEffect(() => {
    if (selectedMailboxId === undefined) {
      return;
    }

    setActiveId(getInitialActiveId(groups));
  }, [getInitialActiveId, groups, selectedMailboxId]);

  const handleActiveIdChange = useCallback(
    (nextActiveId: string) => {
      setActiveId(nextActiveId);

      if (nextActiveId === CREATE_TAB_ID) {
        router.push('/admin/email2');

        return;
      }

      const mailboxId = nextActiveId.replace(/^mailbox-/, '');

      router.push(`/admin/email2/${mailboxId}`);
    },
    [router],
  );

  const updateComposeField = useCallback(
    (field: keyof ComposeFormState, value: string) => {
      setComposeForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }));
      setComposeResult(null);
    },
    [],
  );

  const openComposeModal = useCallback((mailbox: EmailMailboxSummary) => {
    setComposeMailbox(mailbox);
    setComposeForm(defaultComposeForm);
    setComposeResult(null);
  }, []);

  const closeComposeModal = useCallback(() => {
    setComposeMailbox(null);
    setComposeForm(defaultComposeForm);
    setComposeResult(null);
  }, []);

  const handleSendEmail = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (composeMailbox === null) {
      return;
    }

    setComposeSending(true);
    setComposeResult(null);

    try {
      const response = await fetch('/api/admin/email/threads', {
        body: JSON.stringify({
          mailboxId: composeMailbox.id,
          ...composeForm,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const payload = (await response.json()) as SendEmailResponse;

      setComposeResult(payload);

      if (response.ok && payload.success && payload.thread !== undefined) {
        const createdThread = payload.thread;

        setGroups((currentGroups) =>
          currentGroups.map((group) =>
            group.mailbox.id === composeMailbox.id
              ? {
                ...group,
                threads: [createdThread, ...group.threads],
              }
              : group,
          ),
        );
        closeComposeModal();
      }
    } catch {
      setComposeResult({
        success: false,
        message: 'Failed to send email.',
      });
    } finally {
      setComposeSending(false);
    }
  }, [closeComposeModal, composeForm, composeMailbox]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedPrefix = prefix.trim();

    if (normalizedPrefix.length === 0) {
      setResult({
        success: false,
        message: 'Email prefix is required.',
      });

      return;
    }

    setSaving(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/email/mailboxes', {
        body: JSON.stringify({
          displayName: displayName.trim(),
          prefix: normalizedPrefix,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const payload = (await response.json()) as CreateMailboxResponse;

      setResult(payload);

      if (response.ok && payload.success && payload.group !== undefined) {
        const createdGroup = payload.group;

        setGroups((currentGroups) =>
          [...currentGroups, createdGroup].sort((a, b) =>
            a.mailbox.normalizedAddress.localeCompare(
              b.mailbox.normalizedAddress,
            ),
          ),
        );
        setPrefix('');
        setDisplayName('');
        handleActiveIdChange(`mailbox-${createdGroup.mailbox.id}`);
      }
    } catch {
      setResult({
        success: false,
        message: 'Failed to create mailbox.',
      });
    } finally {
      setSaving(false);
    }
  }, [displayName, handleActiveIdChange, prefix]);

  const tabItems = useMemo<TabItem[]>(
    () => [
      ...groups.map(({ mailbox, threads }) => ({
        id: `mailbox-${mailbox.id}`,
        label: mailbox.address,
        content: (
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-200">
                {threads.length} Conversations
              </p>
              <button
                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                onClick={() => openComposeModal(mailbox)}
                type="button"
              >
                Create new email
              </button>
            </div>

            {threads.length > 0 ? (
              <div>
                {threads.map((thread) => (
                  <button
                    className="block w-full border-b border-slate-100 px-5 py-5 text-left transition last:border-b-0 hover:bg-emerald-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-slate-800 dark:hover:bg-emerald-950/20"
                    key={thread.id}
                    onClick={() =>
                      router.push(`/admin/email2/${mailbox.id}/${thread.id}`)
                    }
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-2.5">
                        <p className="truncate text-base font-bold text-slate-950 dark:text-white">
                          Participants: {formatAddressList(thread.participants)}
                        </p>
                        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {thread.subject}
                        </h3>
                        {thread.preview.length > 0 && (
                          <p className="line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {thread.preview}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                            {thread.messageCount} Messages
                          </span>
                          {thread.attachmentsCount > 0 && (
                            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              {thread.attachmentsCount} Attachments
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {formatThreadDate(thread.lastMessageDate)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-5 py-8 text-sm text-slate-500 dark:text-slate-400">
                No threads.
              </p>
            )}
          </div>
        ),
      })),
      {
        id: CREATE_TAB_ID,
        label: '+',
        content: (
          <form
            className="space-y-4 px-5 pb-6 pt-5"
            onSubmit={(event) => void handleSubmit(event)}
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
                  onChange={(event) => {
                    setDisplayName(event.target.value);
                    setResult(null);
                  }}
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
                    onChange={(event) => {
                      setPrefix(event.target.value);
                      setResult(null);
                    }}
                    placeholder="info"
                    type="text"
                    value={prefix}
                  />
                  <span className="shrink-0 rounded-r-xl border border-l-0 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    @{MAILBOX_DOMAIN}
                  </span>
                </div>
              </div>
            </div>

            {result !== null && (
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

            <button
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              Save
            </button>
          </form>
        ),
      },
    ],
    [
      displayName,
      groups,
      handleSubmit,
      openComposeModal,
      prefix,
      router,
      result,
      saving,
    ],
  );

  return (
    <>
      <Tabs
        activeId={activeId}
        ariaLabel="Email mailboxes"
        items={tabItems}
        onActiveIdChange={handleActiveIdChange}
      />

      {composeMailbox !== null && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
        >
          <form
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            onSubmit={(event) => void handleSendEmail(event)}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  New email
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  From: {formatMailboxFrom(composeMailbox)}
                </p>
              </div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                onClick={closeComposeModal}
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
                  value={formatMailboxFrom(composeMailbox)}
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
                    onChange={(event) =>
                      updateComposeField('to', event.target.value)
                    }
                    placeholder="recipient@example.com"
                    type="text"
                    value={composeForm.to}
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
                    onChange={(event) =>
                      updateComposeField('cc', event.target.value)
                    }
                    placeholder="copy@example.com"
                    type="text"
                    value={composeForm.cc}
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
                    onChange={(event) =>
                      updateComposeField('bcc', event.target.value)
                    }
                    placeholder="hidden@example.com"
                    type="text"
                    value={composeForm.bcc}
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
                  onChange={(event) =>
                    updateComposeField('subject', event.target.value)
                  }
                  placeholder="Email subject"
                  type="text"
                  value={composeForm.subject}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Content
                </label>
                <RichTextEditor
                  onChange={(html) => updateComposeField('bodyHtml', html)}
                />
              </div>

              {composeResult !== null && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    composeResult.success
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                  }`}
                >
                  {composeResult.message}
                </div>
              )}
            </div>

            <footer className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-800">
              <button
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={composeSending}
                type="submit"
              >
                {composeSending ? 'Sending...' : 'Send'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}
