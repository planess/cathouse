import type { EmailRecipientInput } from './email-recipient-input';

export type SendMailboxEmailPayload = {
  mailboxId: string;
  to: EmailRecipientInput[];
  cc: EmailRecipientInput[];
  bcc: EmailRecipientInput[];
  subject: string;
  bodyHtml: string;
};
