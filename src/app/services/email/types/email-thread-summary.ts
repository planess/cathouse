import type { EmailAddressSummary } from './email-address-summary';

export type EmailThreadSummary = {
  id: string;
  mailboxId: string;
  subject: string;
  participants: EmailAddressSummary[];
  participantIds: string[];
  messageCount: number;
  preview: string;
  attachmentsCount: number;
  lastMessageId: string;
  lastMessageDate: string;
  createdAt: string;
  updatedAt: string;
};
