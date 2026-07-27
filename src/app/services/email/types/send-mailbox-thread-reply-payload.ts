import type { AttachmentFile } from './attachment-file';
import type { EmailRecipientInput } from './email-recipient-input';

export type SendMailboxThreadReplyPayload = {
  mailboxId: string;
  threadId: string;
  to: EmailRecipientInput[];
  cc: EmailRecipientInput[];
  bcc: EmailRecipientInput[];
  bodyHtml: string;
  attachments: AttachmentFile[];
};
