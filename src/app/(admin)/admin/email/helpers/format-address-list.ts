import type { EmailAddressSummary } from '@app/services/email.service';

import { formatAddress } from './format-address';

/**
 * Joins addresses into a display string.
 *
 * @param addresses - Addresses to format.
 * @param emptyLabel - Translated text shown when the list is empty.
 */
export function formatAddressList(
  addresses: EmailAddressSummary[],
  emptyLabel: string,
): string {
  if (addresses.length === 0) {
    return emptyLabel;
  }

  return addresses.map(formatAddress).join(', ');
}
