import type { EmailAddress } from '@app/models/email-address.model';

export function isEmailAddress(value: unknown): value is EmailAddress {
  return (
    typeof value === 'object' &&
    value !== null &&
    'address' in value &&
    typeof (value as EmailAddress).address === 'string'
  );
}
