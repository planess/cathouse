import type { EmailAddress } from '@app/models/email-address.model';

export function uniqueEmailAddresses(addresses: EmailAddress[]) {
  return [
    ...new Map(
      addresses.map((address) => [address.normalizedAddress, address]),
    ).values(),
  ];
}
