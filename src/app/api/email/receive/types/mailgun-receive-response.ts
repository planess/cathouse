export type MailgunReceiveResponse = {
  success: boolean;
  message: string;
  result?: {
    messageId: string;
    mailboxId: string;
    threadId: string;
    messageDbId: string;
    duplicate: boolean;
  };
};
