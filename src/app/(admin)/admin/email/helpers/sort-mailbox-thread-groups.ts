import type { EmailMailboxThreadGroup } from '@app/services/email.service';

export function sortMailboxThreadGroups(
  groups: EmailMailboxThreadGroup[],
): EmailMailboxThreadGroup[] {
  return [...groups].sort((a, b) =>
    a.mailbox.normalizedAddress.localeCompare(b.mailbox.normalizedAddress),
  );
}
