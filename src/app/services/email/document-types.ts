import { ObjectId } from 'mongodb';

import type { EmailAddress } from '@app/models/email-address.model';
import type { EmailAttachmentReference } from '@app/models/email-attachment-reference.model';
import type { EmailMailbox } from '@app/models/email-mailbox.model';
import type { EmailMessage } from '@app/models/email-message.model';
import type { EmailThread } from '@app/models/email-thread.model';

export type EmailThreadDocument = Omit<EmailThread, 'participants'> & {
  participants: Array<ObjectId | EmailAddress>;
};

export type EmailContactDocument = EmailAddress & {
  _id: ObjectId;
};

export type EmailAddressReferenceDocument = EmailContactDocument | EmailMailbox;

export type EmailMessageDocument = Omit<
  EmailMessage,
  'from' | 'sender' | 'replyTo' | 'to' | 'cc' | 'bcc' | 'attachments'
> & {
  from: ObjectId | EmailAddress;
  sender?: ObjectId | EmailAddress;
  replyTo?: Array<ObjectId | EmailAddress>;
  to: Array<ObjectId | EmailAddress>;
  cc?: Array<ObjectId | EmailAddress>;
  bcc?: Array<ObjectId | EmailAddress>;
  attachments?: Array<ObjectId | EmailAttachmentReference>;
};

export type EmailAttachmentDocument = EmailAttachmentReference & {
  _id: ObjectId;
};
