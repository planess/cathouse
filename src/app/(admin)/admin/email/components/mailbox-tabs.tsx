'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import type { TabItem } from '@app/components/tabs';
import { Tabs } from '@app/components/tabs';
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

import { ComposeEmailModal } from './compose-email-modal';
import { CreateMailboxForm } from './create-mailbox-form';
import { MailboxTabPanel } from './mailbox-tab-panel';

import type { ComposeFormState } from '../types/compose-form-state';
import type { CreateMailboxResponse } from '../types/create-mailbox-response';
import type { SendEmailResponse } from '../types/send-email-response';

type EmailMailboxTabsProps = {
  mailboxGroups: EmailMailboxThreadGroup[];
  selectedMailboxId?: string;
};

export function EmailMailboxTabs({
  mailboxGroups,
  selectedMailboxId,
}: EmailMailboxTabsProps) {
  const router = useRouter();
  const [groups, setGroups] = useState(mailboxGroups);
  const [activeId, setActiveId] = useState(() =>
    getInitialActiveMailboxTabId(mailboxGroups, selectedMailboxId),
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

  useEffect(() => {
    if (selectedMailboxId === undefined) {
      return;
    }

    setActiveId(getInitialActiveMailboxTabId(groups, selectedMailboxId));
  }, [groups, selectedMailboxId]);

  const handleActiveIdChange = useCallback(
    (nextActiveId: string) => {
      setActiveId(nextActiveId);

      if (nextActiveId === CREATE_MAILBOX_TAB_ID) {
        router.push('/admin/email');

        return;
      }

      router.push(`/admin/email/${getMailboxIdFromTabId(nextActiveId)}`);
    },
    [router],
  );

  const handleThreadSelect = useCallback(
    (mailboxId: string, threadId: string) => {
      router.push(`/admin/email/${mailboxId}/${threadId}`);
    },
    [router],
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
    setComposeMailbox(mailbox);
    setComposeForm(defaultComposeForm);
    setComposeAttachments([]);
    setComposeResult(null);
  }, []);

  const closeComposeModal = useCallback(() => {
    setComposeMailbox(null);
    setComposeForm(defaultComposeForm);
    setComposeAttachments([]);
    setComposeResult(null);
  }, []);

  const handleSendEmail = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (composeMailbox === null) {
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
    [closeComposeModal, composeAttachments, composeForm, composeMailbox],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
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
    [displayName, handleActiveIdChange, prefix],
  );

  const tabItems = useMemo<TabItem[]>(
    () => [
      ...groups.map(({ mailbox, threads }) => ({
        id: getMailboxTabId(mailbox.id),
        label: mailbox.address,
        content: (
          <MailboxTabPanel
            mailbox={mailbox}
            onCompose={openComposeModal}
            onThreadSelect={handleThreadSelect}
            threads={threads}
          />
        ),
      })),
      {
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
      },
    ],
    [
      displayName,
      groups,
      handleSubmit,
      handleThreadSelect,
      openComposeModal,
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
    </>
  );
}
