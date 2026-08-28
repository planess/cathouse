import type { EmailRecipientInput } from './email-recipient-input';

export type SendMailboxEmailPayload = {
  mailboxId: string;
  attachments: File[];
  to: EmailRecipientInput[];
  cc: EmailRecipientInput[];
  bcc: EmailRecipientInput[];
  subject: string;
  bodyHtml: string;
};
