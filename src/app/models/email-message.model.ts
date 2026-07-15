import { ObjectId } from 'mongodb';

import { EmailAddress } from './email-address.model';
import { EmailAttachmentReference } from './email-attachment-reference.model';

export interface EmailMessage {
  _id: ObjectId;

  // Internal and standard identifiers
  messageId: string; // Message-ID header value
  threadId: ObjectId;

  inReplyTo?: string; // Message-ID of the previous email
  references?: string[]; // Message-ID chain

  direction: 'incoming' | 'outgoing';

  // status:
  //   | 'draft'
  //   | 'queued'
  //   | 'sending'
  //   | 'sent'
  //   | 'delivered'
  //   | 'failed'
  //   | 'received';

  // Email participants
  from: EmailAddress;
  sender?: EmailAddress;
  replyTo?: EmailAddress[];

  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];

  subject: string;

  content: {
    text?: string;
    html?: string;
  };

  attachments: EmailAttachmentReference[];

  headers: {
    [headerName: string]: string | string[];
  };

  // Data for display in email interface
  // flags: {
  //   isRead: boolean;
  //   isStarred: boolean;
  //   isImportant: boolean;
  //   isDraft: boolean;
  //   isAnswered: boolean;
  //   isForwarded: boolean;
  //   hasAttachments: boolean;
  // };

  // folders: EmailFolder[];
  // labels: ObjectId[];

  dates: {
    headerDate?: Date; // Date from email header
    receivedAt?: Date;
    sentAt?: Date;
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  };

  // delivery?: {
  //   attempts: number;
  //   lastAttemptAt?: Date;
  //   nextAttemptAt?: Date;

  //   providerMessageId?: string;
  //   smtpResponse?: string;
  //   errorCode?: string;
  //   errorMessage?: string;
  // };

  // security: {
  //   spamScore?: number;
  //   isSpam: boolean;
  //   hasSuspiciousContent: boolean;

  //   spf?: 'pass' | 'fail' | 'softfail' | 'neutral' | 'none';
  //   dkim?: 'pass' | 'fail' | 'none';
  //   dmarc?: 'pass' | 'fail' | 'none';

  //   encryption?: {
  //     protocol?: 'tls' | 'pgp' | 'smime';
  //     encrypted: boolean;
  //   };
  // };

  source: {
    protocol: 'smtp' | 'imap' | 'api' | 'internal';
    remoteIp?: string;
    provider?: string;

    // Original MIME email or reference to it
    rawMessageStorageKey?: string;
    rawSizeBytes?: number;
  };

  // deletedAt?: Date;
}
