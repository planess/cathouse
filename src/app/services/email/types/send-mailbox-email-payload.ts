export type SendMailboxEmailPayload = {
  mailboxId: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  bodyHtml: string;
};
