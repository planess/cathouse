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

import { Tabs } from '@app/components/tabs';
import type { TabItem } from '@app/models/tab-item.model';
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

  const tabItems = useMemo<TabItem[]>(
    () => [
      ...groups.map(({ mailbox }) => ({
        id: getMailboxTabId(mailbox.id),
        label: mailbox.address,
        content: (
          <MailboxTabPanel
            mailbox={mailbox}
            canSend={canSend}
            refreshToken={threadRefreshTokens[mailbox.id] ?? 0}
            onCompose={openComposeModal}
            onEditMailbox={openEditMailboxModal}
            onThreadSelect={handleThreadSelect}
          />
        ),
      })),
      ...(canSend ? [{
        id: CREATE_MAILBOX_TAB_ID,
        label: '+',
        content: (
          <CreateMailboxForm
            displayName={displayName}
            onDisplayNameChange={updateCreateMailboxDisplayName}
            onPrefixChange={updateCreateMailboxPrefix}
            onSubmit={handleSubmit}
            prefix={prefix}
            result={result}
            saving={saving}
          />
        ),
      }] : []),
    ],
    [
      displayName,
      canSend,
      groups,
      handleSubmit,
      handleThreadSelect,
      openComposeModal,
      openEditMailboxModal,
      prefix,
      result,
      saving,
      updateCreateMailboxDisplayName,
      updateCreateMailboxPrefix,
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
