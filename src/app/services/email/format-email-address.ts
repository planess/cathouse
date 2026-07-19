import type { EmailAddress } from '@app/models/email-address.model';

export function formatEmailAddress(address: EmailAddress): string {
  return address.name !== undefined && address.name.length > 0
    ? `${address.name} <${address.address}>`
    : address.address;
}
