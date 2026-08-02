import type { EmailMailboxThreadGroup } from '@app/services/email.service';

import { CREATE_MAILBOX_TAB_ID } from '../constants/create-mailbox-tab-id';

import { getMailboxTabId } from './get-mailbox-tab-id';


export function getInitialActiveMailboxTabId(
  groups: EmailMailboxThreadGroup[],
  selectedMailboxId?: string,
): string {
  const selectedGroup = groups.find(
    (group) => group.mailbox.id === selectedMailboxId,
  );

  if (selectedGroup !== undefined) {
    return getMailboxTabId(selectedGroup.mailbox.id);
  }

  return groups.length > 0
    ? getMailboxTabId(groups[0].mailbox.id)
    : CREATE_MAILBOX_TAB_ID;
}
