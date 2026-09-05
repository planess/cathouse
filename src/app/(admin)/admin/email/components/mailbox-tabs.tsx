'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import { EditIcon } from '@app/components/icons/edit-icon';
import { PlusIcon } from '@app/components/icons/plus-icon';
import type {
  EmailMailboxSummary,
  EmailMailboxThreadGroup,
} from '@app/services/email.service';

import { CREATE_MAILBOX_TAB_ID } from '../constants/create-mailbox-tab-id';
import { defaultComposeForm } from '../constants/default-compose-form';
import { createMailboxRequest } from '../helpers/create-mailbox-request';
import { getInitialActiveMailboxTabId } from '../helpers/get-initial-active-mailbox-tab-id';
import {
  getMailboxIdFromTabId,
  getMailboxTabId,
} from '../helpers/get-mailbox-tab-id';
import { sendMailboxEmailRequest } from '../helpers/send-mailbox-email-request';
import { sortMailboxThreadGroups } from '../helpers/sort-mailbox-thread-groups';
import { updateMailboxDisplayNameRequest } from '../helpers/update-mailbox-display-name-request';

import { ComposeEmailModal } from './compose-email-modal';
import { CreateMailboxForm } from './create-mailbox-form';
import { EditMailboxDisplayNameModal } from './edit-mailbox-display-name-modal';
import { MailboxTabPanel } from './mailbox-tab-panel';
import { NavigationLoadingOverlay } from './navigation-loading-overlay';

import type { ComposeFormState } from '../types/compose-form-state';
import type { CreateMailboxResponse } from '../types/create-mailbox-response';
import type { SendEmailResponse } from '../types/send-email-response';

type EmailMailboxTabsProps = {
  canSend: boolean;
  mailboxGroups: EmailMailboxThreadGroup[];
  selectedMailboxId?: string;
  showCreateMailboxForm: boolean;
};

export function EmailMailboxTabs({
  canSend,
  mailboxGroups,
  selectedMailboxId,
  showCreateMailboxForm,
}: EmailMailboxTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isThreadNavigationPending, startThreadNavigation] = useTransition();
  const [groups, setGroups] = useState(mailboxGroups);
  const [threadRefreshTokens, setThreadRefreshTokens] = useState<
    Record<string, number>
  >({});
  const [activeId, setActiveId] = useState(() =>
    showCreateMailboxForm
      ? CREATE_MAILBOX_TAB_ID
      : getInitialActiveMailboxTabId(mailboxGroups, selectedMailboxId),
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
  const [composeAttachments, setComposeAttachments] = useState<File[]>([]);
  const [composeResult, setComposeResult] = useState<SendEmailResponse | null>(
    null,
  );
  const [editingMailbox, setEditingMailbox] =
    useState<EmailMailboxSummary | null>(null);
  const [editingDisplayName, setEditingDisplayName] = useState('');
  const [editingSaving, setEditingSaving] = useState(false);
  const [editingResult, setEditingResult] = useState<SendEmailResponse | null>(
    null,
  );

  useEffect(() => {
    if (showCreateMailboxForm) {
      setActiveId(CREATE_MAILBOX_TAB_ID);

      return;
    }

    const mailboxFromPath = groups.find(
      ({ mailbox }) => pathname === `/admin/email/${mailbox.id}`,
    );

    if (mailboxFromPath !== undefined) {
      setActiveId(getMailboxTabId(mailboxFromPath.mailbox.id));

      return;
    }

  }, [groups, pathname, showCreateMailboxForm]);

  const handleActiveIdChange = useCallback(
    (nextActiveId: string) => {
      if (nextActiveId === CREATE_MAILBOX_TAB_ID) {
        if (!canSend) {
          return;
        }

        window.history.pushState(null, '', '/admin/email/new');
        setActiveId(nextActiveId);

        return;
      }

      const mailboxId = getMailboxIdFromTabId(nextActiveId);

      window.history.pushState(null, '', `/admin/email/${mailboxId}`);
      setActiveId(nextActiveId);
    },
    [canSend],
  );

  const handleThreadSelect = useCallback(
    (mailboxId: string, threadId: string) => {
      startThreadNavigation(() => {
        router.push(`/admin/email/${mailboxId}/${threadId}`);
      });
    },
    [router, startThreadNavigation],
  );

  const updateCreateMailboxPrefix = useCallback((value: string) => {
    setPrefix(value);
    setResult(null);
  }, []);

  const updateCreateMailboxDisplayName = useCallback((value: string) => {
    setDisplayName(value);
    setResult(null);
  }, []);

  const updateComposeField = useCallback(
    (
      field: keyof ComposeFormState,
      value: ComposeFormState[keyof ComposeFormState],
    ) => {
      setComposeForm((currentForm) => ({
        ...currentForm,
        [field]: value,
      }));
      setComposeResult(null);
    },
    [],
  );

  const openComposeModal = useCallback((mailbox: EmailMailboxSummary) => {
    if (!canSend) {
      return;
    }

    setComposeMailbox(mailbox);
    setComposeForm(defaultComposeForm);
    setComposeAttachments([]);
    setComposeResult(null);
  }, [canSend]);

  const closeComposeModal = useCallback(() => {
    setComposeMailbox(null);
    setComposeForm(defaultComposeForm);
    setComposeAttachments([]);
    setComposeResult(null);
  }, []);

  const openEditMailboxModal = useCallback((mailbox: EmailMailboxSummary) => {
    if (!canSend) {
      return;
    }

    setEditingMailbox(mailbox);
    setEditingDisplayName(mailbox.displayName);
    setEditingResult(null);
  }, [canSend]);

  const closeEditMailboxModal = useCallback(() => {
    setEditingMailbox(null);
    setEditingDisplayName('');
    setEditingResult(null);
  }, []);

  const handleEditMailboxSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!canSend || editingMailbox === null) {
        return;
      }

      setEditingSaving(true);
      setEditingResult(null);

      try {
        const { ok, payload } = await updateMailboxDisplayNameRequest(
          editingMailbox.id,
          editingDisplayName,
        );

        setEditingResult(payload);

        if (ok && payload.success && payload.mailbox !== undefined) {
          setGroups((currentGroups) =>
            currentGroups.map((group) =>
              group.mailbox.id === payload.mailbox?.id
                ? { ...group, mailbox: payload.mailbox }
                : group,
            ),
          );
          closeEditMailboxModal();
        }
      } catch {
        setEditingResult({
          success: false,
          message: 'Failed to update sender name.',
        });
      } finally {
        setEditingSaving(false);
      }
    }, [canSend, closeEditMailboxModal, editingDisplayName, editingMailbox],
  );

  const handleSendEmail = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!canSend || composeMailbox === null) {
        return;
      }

      setComposeSending(true);
      setComposeResult(null);

      try {
        const { ok, payload } = await sendMailboxEmailRequest(
          composeMailbox.id,
          composeForm,
          composeAttachments,
        );

        setComposeResult(payload);

        if (ok && payload.success && payload.thread !== undefined) {
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
          setThreadRefreshTokens((currentTokens) => ({
            ...currentTokens,
            [composeMailbox.id]: (currentTokens[composeMailbox.id] ?? 0) + 1,
          }));
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
    },
    [canSend, closeComposeModal, composeAttachments, composeForm, composeMailbox],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!canSend) {
        return;
      }

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
        const { ok, payload } = await createMailboxRequest(
          normalizedPrefix,
          displayName,
        );

        setResult(payload);

        if (ok && payload.success && payload.group !== undefined) {
          const createdGroup = payload.group;

          setGroups((currentGroups) =>
            sortMailboxThreadGroups([...currentGroups, createdGroup]),
          );
          setPrefix('');
          setDisplayName('');
          handleActiveIdChange(getMailboxTabId(createdGroup.mailbox.id));
        }
      } catch {
        setResult({
          success: false,
          message: 'Failed to create mailbox.',
        });
      } finally {
        setSaving(false);
      }
    },
    [canSend, displayName, handleActiveIdChange, prefix],
  );

  const activeMailbox = useMemo(
    () => groups.find(
      ({ mailbox }) => getMailboxTabId(mailbox.id) === activeId,
    )?.mailbox,
    [activeId, groups],
  );

  const activeContent = useMemo(
    () => activeId === CREATE_MAILBOX_TAB_ID ? (
      <CreateMailboxForm
        displayName={displayName}
        onDisplayNameChange={updateCreateMailboxDisplayName}
        onPrefixChange={updateCreateMailboxPrefix}
        onSubmit={handleSubmit}
        prefix={prefix}
        result={result}
        saving={saving}
      />
    ) : activeMailbox !== undefined ? (
      <MailboxTabPanel
        mailbox={activeMailbox}
        canSend={canSend}
        refreshToken={threadRefreshTokens[activeMailbox.id] ?? 0}
        onCompose={openComposeModal}
        onThreadSelect={handleThreadSelect}
      />
    ) : null,
    [
      activeId,
      activeMailbox,
      displayName,
      canSend,
      handleSubmit,
      handleThreadSelect,
      openComposeModal,
      openEditMailboxModal,
      prefix,
      result,
      saving,
      threadRefreshTokens,
      updateCreateMailboxDisplayName,
      updateCreateMailboxPrefix,
    ],
  );

  return (
    <>
      <div className="md:flex md:min-h-[34rem] md:gap-4">
        <aside className="hidden w-72 shrink-0 self-start overflow-hidden md:sticky md:top-4 md:flex md:h-[calc(100vh-2rem)] md:flex-col md:rounded-2xl md:border md:border-slate-200/70 md:bg-white md:shadow-sm md:shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Mailboxes
            </h2>
            {canSend && (
              <button
                aria-label="Add mailbox"
                className="rounded-lg p-1.5 text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-200 dark:hover:bg-emerald-950/30"
                onClick={() => handleActiveIdChange(CREATE_MAILBOX_TAB_ID)}
                title="Add mailbox"
                type="button"
              >
                <PlusIcon
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                />
              </button>
            )}
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-3">
            {groups.map(({ mailbox }) => {
              const mailboxTabId = getMailboxTabId(mailbox.id);
              const isActive = mailboxTabId === activeId;

              return (
                <div
                  className={`group flex items-center gap-1 rounded-xl transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-emerald-200'
                  }`}
                  key={mailbox.id}
                >
                  <button
                    aria-current={isActive ? 'page' : undefined}
                    className="min-w-0 flex-1 px-3 py-2.5 text-left text-sm font-medium"
                    onClick={() => handleActiveIdChange(mailboxTabId)}
                    type="button"
                  >
                    <span className="block truncate">{mailbox.address}</span>
                    {mailbox.displayName.trim().length > 0 && (
                      <span className="mt-0.5 block truncate text-xs font-normal text-slate-500 dark:text-slate-400">
                        {mailbox.displayName}
                      </span>
                    )}
                  </button>
                  {canSend && (
                    <button
                      aria-label={`Edit sender name for ${mailbox.address}`}
                      className="mr-2 rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-200"
                      onClick={() => openEditMailboxModal(mailbox)}
                      title="Edit sender name"
                      type="button"
                    >
                      <EditIcon
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1 md:overflow-hidden md:rounded-2xl md:border md:border-slate-200/70 md:bg-white md:shadow-sm md:shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800 md:hidden">
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              htmlFor="email-mailbox-selector"
            >
              Mailbox
            </label>
            <div className="flex items-center gap-2">
              <select
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                id="email-mailbox-selector"
                onChange={(event) => handleActiveIdChange(event.target.value)}
                value={activeId}
              >
                {groups.map(({ mailbox }) => (
                  <option key={mailbox.id} value={getMailboxTabId(mailbox.id)}>
                    {mailbox.address}
                  </option>
                ))}
                {canSend && (
                  <option value={CREATE_MAILBOX_TAB_ID}>Add mailbox</option>
                )}
              </select>
              {canSend && activeMailbox !== undefined && (
                <button
                  aria-label={`Edit sender name for ${activeMailbox.address}`}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-emerald-200"
                  onClick={() => openEditMailboxModal(activeMailbox)}
                  title="Edit sender name"
                  type="button"
                >
                  <EditIcon
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  />
                </button>
              )}
            </div>
          </div>

          {activeContent}
        </div>
      </div>

      {isThreadNavigationPending && (
        <NavigationLoadingOverlay label="Opening conversation..." />
      )}

      {composeMailbox !== null && (
        <ComposeEmailModal
          attachments={composeAttachments}
          form={composeForm}
          onAttachmentsChange={setComposeAttachments}
          mailbox={composeMailbox}
          onChange={updateComposeField}
          onClose={closeComposeModal}
          onSubmit={handleSendEmail}
          result={composeResult}
          sending={composeSending}
        />
      )}

      {editingMailbox !== null && (
        <EditMailboxDisplayNameModal
          displayName={editingDisplayName}
          mailbox={editingMailbox}
          onClose={closeEditMailboxModal}
          onDisplayNameChange={(displayName) => {
            setEditingDisplayName(displayName);
            setEditingResult(null);
          }}
          onSubmit={handleEditMailboxSubmit}
          result={editingResult}
          saving={editingSaving}
        />
      )}
    </>
  );
}
