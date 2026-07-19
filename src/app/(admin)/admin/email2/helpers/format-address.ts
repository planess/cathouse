import type { EmailAddressSummary } from '@app/services/email.service';

export function formatAddress(address: EmailAddressSummary): string {
  return address.name !== undefined && address.name.length > 0
    ? `${address.name} <${address.address}>`
    : address.address;
}
