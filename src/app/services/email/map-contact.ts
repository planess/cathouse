import type { EmailContactDocument } from './document-types';
import type { EmailAddressSummary } from './types/email-address-summary';

export function mapContact(contact: EmailContactDocument): EmailAddressSummary {
  return {
    id: contact._id.toString(),
    ...(contact.name !== undefined && contact.name.length > 0
      ? { name: contact.name }
      : {}),
    address: contact.address,
  };
}
