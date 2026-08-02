import type { EmailMailboxSummary } from '@app/services/email.service';

export function formatMailboxFrom(mailbox: EmailMailboxSummary): string {
  return mailbox.displayName !== mailbox.address
    ? `${mailbox.displayName} <${mailbox.address}>`
    : mailbox.address;
}
