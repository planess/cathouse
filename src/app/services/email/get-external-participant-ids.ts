import { ObjectId } from 'mongodb';

import { isEmailContactDocument } from './is-email-contact-document';

import type { EmailAddressReferenceDocument } from './document-types';

export function getExternalParticipantIds(
  references: EmailAddressReferenceDocument[],
): ObjectId[] {
  return [
    ...new Map(
      references
        .filter(isEmailContactDocument)
        .map((contact) => [contact._id.toString(), contact._id]),
    ).values(),
  ];
}
