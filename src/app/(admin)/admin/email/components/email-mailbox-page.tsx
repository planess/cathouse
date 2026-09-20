import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import { loadMailboxThreadGroups } from '../helpers/load-mailbox-thread-groups';

import { EmailMailboxPageContent } from './email-mailbox-page-content';

type EmailMailboxPageProps = {
  route: string;
  selectedMailboxId?: string;
  showCreateMailboxForm?: boolean;
};

export async function EmailMailboxPage({
  route,
  selectedMailboxId,
  showCreateMailboxForm = false,
}: EmailMailboxPageProps) {
  const mailboxGroups = await loadMailboxThreadGroups({
    mailboxId: selectedMailboxId,
    route,
    scope:
      selectedMailboxId === undefined
        ? 'email.page.listMailboxThreadGroups'
        : 'email.mailboxPage.listMailboxThreadGroups',
  });

  if (mailboxGroups === null) {
    return null;
  }
  const canSend = await hasPermission(SYSTEM_PERMISSIONS.EMAIL_SEND);

  return (
    <EmailMailboxPageContent
      mailboxGroups={mailboxGroups}
      canSend={canSend}
      selectedMailboxId={selectedMailboxId}
      showCreateMailboxForm={showCreateMailboxForm}
    />
  );
}
