import type { EmailContactSummary } from '@app/models/email-contact-summary';

import type { EmailContactDocument } from './document-types';

/**
 * Maps a persisted email contact to its serializable representation.
 *
 * @param contact Persisted email contact document.
 */
export function mapContact(contact: EmailContactDocument): EmailContactSummary {
  return {
    id: contact._id.toString(),
    ...(contact.name !== undefined && contact.name.length > 0
      ? { name: contact.name }
      : {}),
    address: contact.address,
  };
}
