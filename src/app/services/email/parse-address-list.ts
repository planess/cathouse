import type { EmailAddress } from '@app/models/email-address.model';

import { parseEmailAddress } from './parse-email-address';

export function parseAddressList(value: string): EmailAddress[] {
  return value
    .split(/[\n,;](?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map(parseEmailAddress);
}
