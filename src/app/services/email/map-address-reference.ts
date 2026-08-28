import { isEmailContactDocument } from './is-email-contact-document';

import type { EmailAddressReferenceDocument } from './document-types';
import type { EmailAddressSummary } from './types/email-address-summary';

export function mapAddressReference(
  reference: EmailAddressReferenceDocument,
): EmailAddressSummary {
  const name = isEmailContactDocument(reference)
    ? reference.name
    : reference.displayName;

  return {
    id: reference._id.toString(),
    ...(name !== undefined && name.length > 0 ? { name } : {}),
    address: reference.address,
  };
}
