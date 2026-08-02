import type { EmailAddressSummary } from '@app/services/email.service';

import { formatAddress } from './format-address';


export function formatAddressList(
  addresses: EmailAddressSummary[],
  emptyLabel = 'No participants',
): string {
  if (addresses.length === 0) {
    return emptyLabel;
  }

  return addresses.map(formatAddress).join(', ');
}
