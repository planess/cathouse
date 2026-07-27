import type { EmailAddress } from '@app/models/email-address.model';

import { parseEmailAddress } from './parse-email-address';

import type { EmailRecipientInput } from './types/email-recipient-input';

export function parseEmailRecipientInputs(
  recipients: EmailRecipientInput[],
): EmailAddress[] {
  return recipients
    .map((recipient) => ({
      name: recipient.name?.trim() ?? '',
      email: recipient.email.trim(),
    }))
    .filter(
      (recipient) => recipient.name.length > 0 || recipient.email.length > 0,
    )
    .map((recipient) => {
      if (recipient.email.length === 0) {
        throw new Error('Invalid recipient email.');
      }

      const address = parseEmailAddress(recipient.email);

      return recipient.name.length === 0
        ? address
        : { ...address, name: recipient.name };
    });
}
