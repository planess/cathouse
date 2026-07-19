import { ObjectId } from 'mongodb';

import type { EmailAddress } from '@app/models/email-address.model';

import { isEmailAddress } from './is-email-address';
import { isObjectId } from './is-object-id';

import type { EmailAddressSummary } from './types/email-address-summary';

export function mapAddress(
  value: ObjectId | EmailAddress | undefined,
  contactsById: Map<string, EmailAddressSummary>,
): EmailAddressSummary {
  if (isObjectId(value)) {
    return (
      contactsById.get(value.toString()) ?? {
        id: value.toString(),
        address: value.toString(),
      }
    );
  }

  if (isEmailAddress(value)) {
    return {
      ...(value.name !== undefined && value.name.length > 0
        ? { name: value.name }
        : {}),
      address: value.address,
    };
  }

  return { address: 'Unknown' };
}
