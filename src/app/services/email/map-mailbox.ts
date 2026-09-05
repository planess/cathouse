import type { EmailMailbox } from '@app/models/email-mailbox.model';

import { toIsoString } from './date-helpers';

import type { EmailMailboxSummary } from './types/email-mailbox-summary';

/**
 * Maps a persisted mailbox to its serializable service representation.
 *
 * @param mailbox Persisted mailbox document.
 */
export function mapMailbox(mailbox: EmailMailbox): EmailMailboxSummary {
  return {
    id: mailbox._id.toString(),
    address: mailbox.address,
    normalizedAddress: mailbox.normalizedAddress,
    displayName: mailbox.displayName ?? mailbox.address,
    order: mailbox.order,
    createdAt: toIsoString(mailbox.createdAt),
    updatedAt: toIsoString(mailbox.updatedAt),
  };
}
