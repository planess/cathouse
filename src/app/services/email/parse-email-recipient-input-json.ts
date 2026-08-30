import type { EmailRecipientInput } from './types/email-recipient-input';

export function parseEmailRecipientInputJson(
  value: FormDataEntryValue | null,
): EmailRecipientInput[] {
  if (typeof value !== 'string') {
    return [];
  }

  try {
    const recipients = JSON.parse(value) as unknown;

    if (!Array.isArray(recipients)) {
      throw new TypeError('Invalid recipient email.');
    }

    return recipients.map((recipient) => {
      if (
        typeof recipient !== 'object' ||
        recipient === null ||
        !('email' in recipient) ||
        typeof recipient.email !== 'string' ||
        ('name' in recipient && typeof recipient.name !== 'string')
      ) {
        throw new Error('Invalid recipient email.');
      }

      return {
        email: recipient.email,
        ...('name' in recipient ? { name: recipient.name } : {}),
      };
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Invalid recipient email.'
    ) {
      throw error;
    }

    throw new Error('Invalid recipient email.');
  }
}
