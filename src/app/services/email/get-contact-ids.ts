import { ObjectId } from 'mongodb';

import type { EmailAddress } from '@app/models/email-address.model';

import { isObjectId } from './is-object-id';

export function getContactIds(
  values: Array<ObjectId | EmailAddress | undefined>,
) {
  return values.filter(isObjectId).map((value) => value.toString());
}
