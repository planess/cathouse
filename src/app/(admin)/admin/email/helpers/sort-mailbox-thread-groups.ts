import type { EmailMailboxThreadGroup } from '@app/services/email.service';

/**
 * Sorts mailbox groups by their persisted position and then by address.
 *
 * @param groups Mailbox groups to sort without mutating the input array.
 */
export function sortMailboxThreadGroups(
  groups: EmailMailboxThreadGroup[],
): EmailMailboxThreadGroup[] {
  return [...groups].sort(
    (a, b) =>
      a.mailbox.order - b.mailbox.order ||
      a.mailbox.normalizedAddress.localeCompare(b.mailbox.normalizedAddress),
  );
}
