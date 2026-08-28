import type { EmailAddress } from '@app/models/email-address.model';

import { parseAddressList } from './parse-address-list';

export function parseOptionalAddressList(
  value: string | undefined,
): EmailAddress[] {
  if (value === undefined || value.trim().length === 0) {
    return [];
  }

  return parseAddressList(value);
}
