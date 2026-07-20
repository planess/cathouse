import type { AttachmentFile } from './attachment-file';

export type SendMailboxThreadReplyPayload = {
  mailboxId: string;
  threadId: string;
  to: string;
  cc: string;
  bcc: string;
  bodyHtml: string;
  attachments: AttachmentFile[];
};
