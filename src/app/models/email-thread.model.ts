import { ObjectId } from 'mongodb';

import { EmailAddress } from './email-address.model';

export interface EmailThread {
  _id: ObjectId;

  mailboxId: ObjectId;

  subject: string; // The subject of the first email in the thread

  participants: EmailAddress[]; // Unique list of all participants in the thread (from, to, cc, bcc)

  messageCount: number;

  lastMessageId: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
