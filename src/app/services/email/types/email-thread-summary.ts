import type { EmailAddressSummary } from './email-address-summary';

export type EmailThreadSummary = {
  id: string;
  mailboxId: string;
  subject: string;
  participants: EmailAddressSummary[];
  participantIds: string[];
  messageCount: number;
  /** Number of messages received by the mailbox in this thread. */
  incomingCount: number;
  /** Number of messages sent from the mailbox in this thread. */
  outgoingCount: number;
  hasUnreadMessages: boolean;
  preview: string;
  attachmentsCount: number;
  lastMessageId: string;
  lastMessageDate: string;
  createdAt: string;
  updatedAt: string;
};
