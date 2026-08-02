import type { EmailAddressSummary } from './email-address-summary';

export type EmailMessageSummary = {
  id: string;
  messageId: string;
  threadId: string;
  direction: 'incoming' | 'outgoing';
  isRead: boolean;
  from: EmailAddressSummary;
  sender?: EmailAddressSummary;
  replyTo: EmailAddressSummary[];
  to: EmailAddressSummary[];
  cc: EmailAddressSummary[];
  bcc: EmailAddressSummary[];
  subject: string;
  content: {
    text?: string;
    html?: string;
  };
  attachmentsCount: number;
  attachments: Array<{
    id: string;
    filename: string;
    contentType: string;
    sizeBytes: number;
    downloadUrl?: string;
  }>;
  headerDate: string;
  createdAt: string;
  receivedAt: string;
  sentAt: string;
};
