import { randomBytes } from 'node:crypto';

import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { MailgunMessageData } from 'mailgun.js/definitions';
import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import { EmailAddress } from '@app/models/email-address.model';
import { EmailAttachmentReference } from '@app/models/email-attachment-reference.model';
import { EmailMailbox } from '@app/models/email-mailbox.model';
import { EmailMessage } from '@app/models/email-message.model';
import { EmailThread } from '@app/models/email-thread.model';

import { logDevelopmentError } from './development-error-logger.service';
import { Singleton } from './singleton';

interface MessageResult {
  status: number; // 200 for success
}

interface AttachmentFile {
  data: Buffer;
  filename: string;
}

interface InlineFile {
  data: Buffer;
  filename: string;
}

export const EMAIL_MAILBOX_DOMAIN = 'perilines.com.ua';

const EMAIL_PREFIX_PATTERN = /^[\w.-]+$/;

type EmailThreadDocument = Omit<EmailThread, 'participants'> & {
  participants: Array<ObjectId | EmailAddress>;
};

type EmailContactDocument = EmailAddress & {
  _id: ObjectId;
};

type EmailMessageDocument = Omit<
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

export type EmailMailboxSummary = {
  id: string;
  address: string;
  normalizedAddress: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

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

export type EmailAddressSummary = {
  id?: string;
  name?: string;
  address: string;
};

export type EmailMessageSummary = {
  id: string;
  messageId: string;
  threadId: string;
  direction: 'incoming' | 'outgoing';
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
  headerDate: string;
  createdAt: string;
  receivedAt: string;
  sentAt: string;
};

export type EmailMailboxThreadGroup = {
  mailbox: EmailMailboxSummary;
  threads: EmailThreadSummary[];
};

export type SendMailboxEmailPayload = {
  mailboxId: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  bodyHtml: string;
};

export type SendMailboxEmailResult = {
  thread: EmailThreadSummary;
};

function toIsoString(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function mapMailbox(mailbox: EmailMailbox): EmailMailboxSummary {
  return {
    id: mailbox._id.toString(),
    address: mailbox.address,
    normalizedAddress: mailbox.normalizedAddress,
    displayName: mailbox.displayName ?? mailbox.address,
    createdAt: toIsoString(mailbox.createdAt),
    updatedAt: toIsoString(mailbox.updatedAt),
  };
}

function isObjectId(value: unknown): value is ObjectId {
  return value instanceof ObjectId;
}

function isEmailAddress(value: unknown): value is EmailAddress {
  return (
    typeof value === 'object' &&
    value !== null &&
    'address' in value &&
    typeof (value as EmailAddress).address === 'string'
  );
}

function mapContact(contact: EmailContactDocument): EmailAddressSummary {
  return {
    id: contact._id.toString(),
    ...(contact.name !== undefined && contact.name.length > 0
      ? { name: contact.name }
      : {}),
    address: contact.address,
  };
}

function mapAddress(
  value: ObjectId | EmailAddress | undefined,
  contactsById: Map<string, EmailAddressSummary>,
): EmailAddressSummary {
  if (isObjectId(value)) {
    return (
      contactsById.get(value.toString()) ?? {
        id: value.toString(),
        address: value.toString(),
      }
    );
  }

  if (isEmailAddress(value)) {
    return {
      ...(value.name !== undefined && value.name.length > 0
        ? { name: value.name }
        : {}),
      address: value.address,
    };
  }

  return { address: 'Unknown' };
}

function getContactIds(values: Array<ObjectId | EmailAddress | undefined>) {
  return values.filter(isObjectId).map((value) => value.toString());
}

function parseEmailAddress(value: string): EmailAddress {
  const trimmed = value.trim();
  const match = /^(.*?)\s*<([^>]+)>$/.exec(trimmed);
  const name = match?.[1]?.trim();
  const address = (match?.[2] ?? trimmed).trim();
  const normalizedAddress = address.toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedAddress)) {
    throw new Error('Invalid recipient email.');
  }

  return {
    ...(name !== undefined && name.length > 0 ? { name } : {}),
    address,
    normalizedAddress,
  };
}

function parseAddressList(value: string): EmailAddress[] {
  return value
    .split(/[\n,;]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map(parseEmailAddress);
}

function formatEmailAddress(address: EmailAddress): string {
  return address.name !== undefined && address.name.length > 0
    ? `${address.name} <${address.address}>`
    : address.address;
}

function stripHtml(value: string): string {
  return value
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function getMessagePreview(message?: EmailMessageDocument): string {
  if (message === undefined) {
    return '';
  }

  return stripHtml(message.content.text ?? message.content.html ?? '');
}

function getMessageDate(message?: EmailMessageDocument): string {
  if (message === undefined) {
    return '';
  }

  return toIsoString(message.dates.headerDate ?? message.dates.createdAt);
}

function getMessageAttachmentsCount(message?: EmailMessageDocument): number {
  return message?.attachments?.length ?? 0;
}

function createMessageId() {
  return `<${randomBytes(16).toString('hex')}@${EMAIL_MAILBOX_DOMAIN}>`;
}

async function getContactsById(contactIds: string[]) {
  const uniqueContactIds = [...new Set(contactIds)]
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  if (uniqueContactIds.length === 0) {
    return new Map<string, EmailAddressSummary>();
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const contacts = await db
    .collection<EmailContactDocument>(DbTables.emailContacts)
    .find({ _id: { $in: uniqueContactIds } })
    .toArray();

  return new Map(
    contacts.map((contact) => [contact._id.toString(), mapContact(contact)]),
  );
}

function mapThread(
  thread: EmailThreadDocument,
  contactsById: Map<string, EmailAddressSummary>,
  lastMessagesById = new Map<string, EmailMessageDocument>(),
): EmailThreadSummary {
  const participantIds = getContactIds(thread.participants);
  const lastMessage = lastMessagesById.get(thread.lastMessageId.toString());

  return {
    id: thread._id.toString(),
    mailboxId: thread.mailboxId.toString(),
    subject: thread.subject,
    participants: thread.participants.map((participant) =>
      mapAddress(participant, contactsById),
    ),
    participantIds,
    messageCount: thread.messageCount,
    preview: getMessagePreview(lastMessage),
    attachmentsCount: getMessageAttachmentsCount(lastMessage),
    lastMessageId: thread.lastMessageId.toString(),
    lastMessageDate:
      getMessageDate(lastMessage) || toIsoString(thread.updatedAt),
    createdAt: toIsoString(thread.createdAt),
    updatedAt: toIsoString(thread.updatedAt),
  };
}

function mapMessage(
  message: EmailMessageDocument,
  contactsById: Map<string, EmailAddressSummary>,
): EmailMessageSummary {
  const cc = message.cc ?? [];
  const bcc = message.bcc ?? [];
  const attachments = message.attachments ?? [];

  return {
    id: message._id.toString(),
    messageId: message.messageId,
    threadId: message.threadId.toString(),
    direction: message.direction,
    from: mapAddress(message.from, contactsById),
    ...(message.sender !== undefined
      ? { sender: mapAddress(message.sender, contactsById) }
      : {}),
    replyTo: (message.replyTo ?? []).map((address) =>
      mapAddress(address, contactsById),
    ),
    to: message.to.map((address) => mapAddress(address, contactsById)),
    cc: cc.map((address) => mapAddress(address, contactsById)),
    bcc: bcc.map((address) => mapAddress(address, contactsById)),
    subject: message.subject,
    content: message.content,
    attachmentsCount: attachments.length,
    headerDate: toIsoString(
      message.dates.headerDate ?? message.dates.createdAt,
    ),
    createdAt: toIsoString(message.dates.createdAt),
    receivedAt: message.dates.receivedAt
      ? toIsoString(message.dates.receivedAt)
      : '',
    sentAt: message.dates.sentAt ? toIsoString(message.dates.sentAt) : '',
  };
}

function normalizeEmailPrefix(prefix: string): string {
  return prefix.trim().toLowerCase();
}

async function logEmailServiceError(
  scope: string,
  error: unknown,
  metadata: Record<string, boolean | number | string | null | undefined> = {},
) {
  await logDevelopmentError(`email.service.${scope}`, error, metadata);
}

async function getLastMessagesById(threads: EmailThreadDocument[]) {
  const messageIds = threads.map((thread) => thread.lastMessageId);

  if (messageIds.length === 0) {
    return new Map<string, EmailMessageDocument>();
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const messages = await db
    .collection<EmailMessageDocument>(DbTables.emailMessages)
    .find({ _id: { $in: messageIds } })
    .toArray();

  return new Map(messages.map((message) => [message._id.toString(), message]));
}

class EmailService extends Singleton {
  mailgun = new Mailgun(FormData);
  client = this.mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY ?? '',
    url: 'https://api.eu.mailgun.net',
  });

  async sendEmail(
    to: string | string[],
    subject: string,
    body: string,
    context = 'info',
    attachments: Array<AttachmentFile> = [],
    inline: Array<InlineFile> = [],
  ): Promise<MessageResult> {
    try {
      const messageParameters = {
        from: `Periphery Foundation<${context}@perilines.com.ua>`,
        to,
        subject,
        html: body, // todo: add text version
      } as MailgunMessageData;

      if (attachments.length > 0) {
        messageParameters.attachment = attachments.map((attachment) => ({
          data: attachment.data,
          filename: attachment.filename,
        }));
      }

      if (inline.length > 0) {
        messageParameters.inline = inline.map((inlineFile) => ({
          data: inlineFile.data,
          filename: inlineFile.filename,
        }));
      }

      return this.client.messages.create('perilines.com.ua', messageParameters);
    } catch (error) {
      await logEmailServiceError('sendEmail', error, {
        attachmentsCount: attachments.length,
        context,
        inlineCount: inline.length,
        subject,
        toCount: Array.isArray(to) ? to.length : 1,
      });

      throw error;
    }
  }

  async sendEmailFromAddress(
    from: EmailAddress,
    to: EmailAddress[],
    cc: EmailAddress[],
    bcc: EmailAddress[],
    subject: string,
    body: string,
  ): Promise<MessageResult> {
    try {
      const messageParameters = {
        from: formatEmailAddress(from),
        to: to.map(formatEmailAddress),
        subject,
        html: body,
      } as MailgunMessageData;

      if (cc.length > 0) {
        messageParameters.cc = cc.map(formatEmailAddress);
      }

      if (bcc.length > 0) {
        messageParameters.bcc = bcc.map(formatEmailAddress);
      }

      return this.client.messages.create('perilines.com.ua', messageParameters);
    } catch (error) {
      await logEmailServiceError('sendEmailFromAddress', error, {
        bccCount: bcc.length,
        ccCount: cc.length,
        from: from.address,
        subject,
        toCount: to.length,
      });

      throw error;
    }
  }

  async listMailboxes(): Promise<EmailMailboxSummary[]> {
    try {
      const dbClient = await clientPromise;
      const db = dbClient.db();
      const mailboxes = await db
        .collection<EmailMailbox>(DbTables.emailMailboxes)
        .find({})
        .sort({ normalizedAddress: 1 })
        .toArray();

      return mailboxes.map(mapMailbox);
    } catch (error) {
      await logEmailServiceError('listMailboxes', error);

      throw error;
    }
  }

  async createMailbox(
    prefix: string,
    displayName?: string,
  ): Promise<EmailMailboxSummary> {
    try {
      const normalizedPrefix = normalizeEmailPrefix(prefix);
      const normalizedDisplayName = displayName?.trim();

      if (!EMAIL_PREFIX_PATTERN.test(normalizedPrefix)) {
        throw new Error('Invalid mailbox prefix.');
      }

      const address = `${normalizedPrefix}@${EMAIL_MAILBOX_DOMAIN}`;
      const now = new Date();
      const mailbox: EmailMailbox = {
        _id: new ObjectId(),
        address,
        normalizedAddress: address,
        ...(normalizedDisplayName !== undefined &&
        normalizedDisplayName.length > 0
          ? { displayName: normalizedDisplayName }
          : {}),
        createdAt: now,
        updatedAt: now,
      };
      const dbClient = await clientPromise;
      const db = dbClient.db();
      const existingMailbox = await db
        .collection<EmailMailbox>(DbTables.emailMailboxes)
        .findOne({ normalizedAddress: mailbox.normalizedAddress });

      if (existingMailbox) {
        throw new Error('Mailbox already exists.');
      }

      await db
        .collection<EmailMailbox>(DbTables.emailMailboxes)
        .insertOne(mailbox);

      return mapMailbox(mailbox);
    } catch (error) {
      await logEmailServiceError('createMailbox', error, {
        displayName,
        prefix,
      });

      throw error;
    }
  }

  async createOrUpdateContact(address: EmailAddress) {
    try {
      const dbClient = await clientPromise;
      const db = dbClient.db();
      const existingContact = await db
        .collection<EmailContactDocument>(DbTables.emailContacts)
        .findOne({ normalizedAddress: address.normalizedAddress });

      if (existingContact) {
        if (address.name !== undefined && address.name.length > 0) {
          await db
            .collection<EmailContactDocument>(DbTables.emailContacts)
            .updateOne(
              { _id: existingContact._id },
              {
                $set: {
                  name: address.name,
                  address: address.address,
                },
              },
            );

          return {
            ...existingContact,
            name: address.name,
            address: address.address,
          };
        }

        return existingContact;
      }

      const contact: EmailContactDocument = {
        _id: new ObjectId(),
        ...address,
      };

      await db
        .collection<EmailContactDocument>(DbTables.emailContacts)
        .insertOne(contact);

      return contact;
    } catch (error) {
      await logEmailServiceError('createOrUpdateContact', error, {
        address: address.address,
        hasName: address.name !== undefined && address.name.length > 0,
        normalizedAddress: address.normalizedAddress,
      });

      throw error;
    }
  }

  async sendMailboxEmail(
    payload: SendMailboxEmailPayload,
  ): Promise<SendMailboxEmailResult> {
    try {
      if (!ObjectId.isValid(payload.mailboxId)) {
        throw new Error('Invalid mailbox id.');
      }

      const subject = payload.subject.trim();
      const bodyHtml = payload.bodyHtml.trim();

      if (subject.length === 0) {
        throw new Error('Subject is required.');
      }

      if (stripHtml(bodyHtml).length === 0) {
        throw new Error('Email body is required.');
      }

      const to = parseAddressList(payload.to);
      const cc = parseAddressList(payload.cc);
      const bcc = parseAddressList(payload.bcc);

      if (to.length === 0) {
        throw new Error('At least one recipient email is required.');
      }

      const dbClient = await clientPromise;
      const db = dbClient.db();
      const mailbox = await db
        .collection<EmailMailbox>(DbTables.emailMailboxes)
        .findOne({ _id: new ObjectId(payload.mailboxId) });

      if (!mailbox) {
        throw new Error('Mailbox not found.');
      }

      const from: EmailAddress = {
        ...(mailbox.displayName !== undefined && mailbox.displayName.length > 0
          ? { name: mailbox.displayName }
          : {}),
        address: mailbox.address,
        normalizedAddress: mailbox.normalizedAddress,
      };
      const result = await this.sendEmailFromAddress(
        from,
        to,
        cc,
        bcc,
        subject,
        bodyHtml,
      );

      if (result.status !== 200) {
        throw new Error('Failed to send email.');
      }

      const contacts = await Promise.all(
        [from, ...to, ...cc, ...bcc].map((address) =>
          this.createOrUpdateContact(address),
        ),
      );
      const fromContact = contacts[0];
      const toContacts = contacts.slice(1, 1 + to.length);
      const ccContacts = contacts.slice(
        1 + to.length,
        1 + to.length + cc.length,
      );
      const bccContacts = contacts.slice(1 + to.length + cc.length);
      const participantIds = [
        ...new Map(
          contacts.map((contact) => [contact._id.toString(), contact._id]),
        ).values(),
      ];
      const now = new Date();
      const threadId = new ObjectId();
      const messageObjectId = new ObjectId();
      const messageId = createMessageId();
      const thread: EmailThreadDocument = {
        _id: threadId,
        mailboxId: mailbox._id,
        subject,
        participants: participantIds,
        messageCount: 1,
        lastMessageId: messageObjectId,
        createdAt: now,
        updatedAt: now,
      };

      await db
        .collection<EmailThreadDocument>(DbTables.emailThreads)
        .insertOne(thread);
      const message: EmailMessageDocument = {
        _id: messageObjectId,
        messageId,
        threadId,
        direction: 'outgoing',
        from: fromContact._id,
        to: toContacts.map((contact) => contact._id),
        cc: ccContacts.map((contact) => contact._id),
        bcc: bccContacts.map((contact) => contact._id),
        subject,
        content: {
          text: stripHtml(bodyHtml),
          html: bodyHtml,
        },
        attachments: [],
        headers: {
          'Message-ID': messageId,
        },
        source: {
          protocol: 'API',
          provider: 'mailgun',
        },
        dates: {
          headerDate: now,
          sentAt: now,
          createdAt: now,
          updatedAt: now,
        },
      };

      try {
        await db.collection(DbTables.emailMessages).insertOne(message);
      } catch (err) {
         console.dir(err, { depth: null });

         throw err;
      }
      

      const contactsById = new Map(
        contacts.map((contact) => [
          contact._id.toString(),
          mapContact(contact),
        ]),
      );

      return {
        thread: mapThread(
          thread,
          contactsById,
          new Map([[messageObjectId.toString(), message]]),
        ),
      };
    } catch (error) {
      await logEmailServiceError('sendMailboxEmail', error, {
        bccLength: payload.bcc.length,
        bodyHtmlLength: payload.bodyHtml.length,
        ccLength: payload.cc.length,
        mailboxId: payload.mailboxId,
        subject: payload.subject,
        toLength: payload.to.length,
      });

      throw error;
    }
  }

  async listThreadsByMailbox(
    mailboxId: string | ObjectId,
  ): Promise<EmailThreadSummary[]> {
    try {
      const parsedMailboxId =
        typeof mailboxId === 'string' ? new ObjectId(mailboxId) : mailboxId;
      const dbClient = await clientPromise;
      const db = dbClient.db();
      const threads = await db
        .collection<EmailThreadDocument>(DbTables.emailThreads)
        .find({ mailboxId: parsedMailboxId })
        .sort({ updatedAt: -1 })
        .toArray();
      const contactsById = await getContactsById(
        threads.flatMap((thread) => getContactIds(thread.participants)),
      );
      const lastMessagesById = await getLastMessagesById(threads);

      return threads.map((thread) =>
        mapThread(thread, contactsById, lastMessagesById),
      );
    } catch (error) {
      await logEmailServiceError('listThreadsByMailbox', error, {
        mailboxId: mailboxId.toString(),
      });

      throw error;
    }
  }

  async getThread(threadId: string): Promise<EmailThreadSummary | null> {
    try {
      if (!ObjectId.isValid(threadId)) {
        throw new Error('Invalid thread id.');
      }

      const dbClient = await clientPromise;
      const db = dbClient.db();
      const thread = await db
        .collection<EmailThreadDocument>(DbTables.emailThreads)
        .findOne({ _id: new ObjectId(threadId) });

      if (!thread) {
        return null;
      }

      const contactsById = await getContactsById(
        getContactIds(thread.participants),
      );

      return mapThread(thread, contactsById);
    } catch (error) {
      await logEmailServiceError('getThread', error, {
        threadId,
      });

      throw error;
    }
  }

  async listMessagesByThread(threadId: string): Promise<EmailMessageSummary[]> {
    try {
      if (!ObjectId.isValid(threadId)) {
        throw new Error('Invalid thread id.');
      }

      const dbClient = await clientPromise;
      const db = dbClient.db();
      const messages = await db
        .collection<EmailMessageDocument>(DbTables.emailMessages)
        .find({ threadId: new ObjectId(threadId) })
        .sort({ 'dates.headerDate': 1, 'dates.createdAt': 1 })
        .toArray();
      const contactsById = await getContactsById(
        messages.flatMap((message) => [
          ...getContactIds([message.from, message.sender]),
          ...getContactIds(message.replyTo ?? []),
          ...getContactIds(message.to),
          ...getContactIds(message.cc ?? []),
          ...getContactIds(message.bcc ?? []),
        ]),
      );

      return messages.map((message) => mapMessage(message, contactsById));
    } catch (error) {
      await logEmailServiceError('listMessagesByThread', error, {
        threadId,
      });

      throw error;
    }
  }

  async listMailboxThreadGroups(): Promise<EmailMailboxThreadGroup[]> {
    try {
      const dbClient = await clientPromise;
      const db = dbClient.db();
      const mailboxes = await db
        .collection<EmailMailbox>(DbTables.emailMailboxes)
        .find({})
        .sort({ normalizedAddress: 1 })
        .toArray();
      const mailboxIds = mailboxes.map((mailbox) => mailbox._id);
      const threads =
        mailboxIds.length > 0
          ? await db
              .collection<EmailThreadDocument>(DbTables.emailThreads)
              .find({ mailboxId: { $in: mailboxIds } })
              .sort({ updatedAt: -1 })
              .toArray()
          : [];
      const threadsByMailboxId = new Map<string, EmailThreadSummary[]>();
      const contactsById = await getContactsById(
        threads.flatMap((thread) => getContactIds(thread.participants)),
      );
      const lastMessagesById = await getLastMessagesById(threads);

      for (const thread of threads) {
        const mailboxId = thread.mailboxId.toString();
        const mailboxThreads = threadsByMailboxId.get(mailboxId) ?? [];

        mailboxThreads.push(mapThread(thread, contactsById, lastMessagesById));
        threadsByMailboxId.set(mailboxId, mailboxThreads);
      }

      return mailboxes.map((mailbox) => ({
        mailbox: mapMailbox(mailbox),
        threads: threadsByMailboxId.get(mailbox._id.toString()) ?? [],
      }));
    } catch (error) {
      await logEmailServiceError('listMailboxThreadGroups', error);

      throw error;
    }
  }
}

export const emailService = EmailService.getInstance<EmailService>();
