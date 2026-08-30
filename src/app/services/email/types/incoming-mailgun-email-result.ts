export type IncomingMailgunEmailResult = {
  messageId: string;
  mailboxId: string;
  threadId: string;
  messageDbId: string;
  duplicate: boolean;
};
