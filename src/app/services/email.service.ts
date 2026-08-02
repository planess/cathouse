import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { EmailAddress } from '@app/models/email-address.model';
import type { EmailMailbox } from '@app/models/email-mailbox.model';

import {
  EMAIL_MAILBOX_DOMAIN,
  EMAIL_PREFIX_PATTERN,
} from './email/constants';
import { createMessageId } from './email/create-message-id';
import { createEmailAttachmentFolder } from './email/create-email-attachment-folder';
import { createForwardedEmailHtml } from './email/create-forwarded-email-html';
import { formatEmailAddress } from './email/format-email-address';
import { getContactIds } from './email/get-contact-ids';
import { getContactsById } from './email/get-contacts-by-id';
import { getExternalParticipantIds } from './email/get-external-participant-ids';
import { getHeaderValue } from './email/get-header-value';
import { getLastMessagesById } from './email/get-last-messages-by-id';
import { getMailgunField } from './email/get-mailgun-field';
import { logEmailServiceError } from './email/log-email-service-error';
import { mapAddressReference } from './email/map-address-reference';
import { mapMailbox } from './email/map-mailbox';
import { mapMessage } from './email/map-message';
import { mapThread } from './email/map-thread';
import { normalizeEmailPrefix } from './email/normalize-email-prefix';
import { normalizeMessageId } from './email/normalize-message-id';
import { parseAddressList } from './email/parse-address-list';
import { parseContentIdMap } from './email/parse-content-id-map';
import { parseEmailAddress } from './email/parse-email-address';
import { parseEmailRecipientInputs } from './email/parse-email-recipient-inputs';
import { parseHeaderDate } from './email/parse-header-date';
import { parseIncomingMailboxRecipients } from './email/parse-incoming-mailbox-recipients';
import { parseMailgunHeaders } from './email/parse-mailgun-headers';
import { parseOptionalAddressList } from './email/parse-optional-address-list';
import { parseReferences } from './email/parse-references';
import { stripHtml } from './email/strip-html';
import { Singleton } from './singleton';

import type {
  EmailAttachmentDocument,
  EmailAddressReferenceDocument,
  EmailContactDocument,
  EmailMessageDocument,
  EmailReadStateDocument,
  EmailThreadDocument,
} from './email/document-types';
import type { AttachmentFile } from './email/types/attachment-file';
import type { EmailMailboxSummary } from './email/types/email-mailbox-summary';
import type { EmailMailboxThreadGroup } from './email/types/email-mailbox-thread-group';
import type { EmailMessageSummary } from './email/types/email-message-summary';
import type { EmailThreadSummary } from './email/types/email-thread-summary';
import type { ForwardMailboxMessagePayload } from './email/types/forward-mailbox-message-payload';
import type { IncomingMailgunAttachment } from './email/types/incoming-mailgun-attachment';
import type { IncomingMailgunEmailPayload } from './email/types/incoming-mailgun-email-payload';
import type { IncomingMailgunEmailResult } from './email/types/incoming-mailgun-email-result';
import type { InlineFile } from './email/types/inline-file';
import type { MessageResult } from './email/types/message-result';
import type { SendMailboxEmailPayload } from './email/types/send-mailbox-email-payload';
import type { SendMailboxEmailResult } from './email/types/send-mailbox-email-result';
import type { SendMailboxThreadReplyPayload } from './email/types/send-mailbox-thread-reply-payload';
import type { SendMailboxThreadReplyResult } from './email/types/send-mailbox-thread-reply-result';
import type { MailgunMessageData } from 'mailgun.js/definitions';

export type { EmailAddressSummary } from './email/types/email-address-summary';
export type { EmailMailboxSummary } from './email/types/email-mailbox-summary';
export type { EmailMailboxThreadGroup } from './email/types/email-mailbox-thread-group';
export type { EmailMessageSummary } from './email/types/email-message-summary';
export type { EmailThreadSummary } from './email/types/email-thread-summary';
export type { ForwardMailboxMessagePayload } from './email/types/forward-mailbox-message-payload';
export type { IncomingMailgunEmailPayload } from './email/types/incoming-mailgun-email-payload';
export type { IncomingMailgunEmailResult } from './email/types/incoming-mailgun-email-result';
export type { SendMailboxEmailPayload } from './email/types/send-mailbox-email-payload';
export type { SendMailboxEmailResult } from './email/types/send-mailbox-email-result';
export type { SendMailboxThreadReplyPayload } from './email/types/send-mailbox-thread-reply-payload';
export type { SendMailboxThreadReplyResult } from './email/types/send-mailbox-thread-reply-result';

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
        from: `Periphery Foundation<${context}@${EMAIL_MAILBOX_DOMAIN}>`,
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

      return this.client.messages.create(EMAIL_MAILBOX_DOMAIN, messageParameters);
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
    attachments: Array<AttachmentFile> = [],
    headers: Record<string, string> = {},
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

      if (attachments.length > 0) {
        messageParameters.attachment = attachments.map((attachment) => ({
          data: attachment.data,
          filename: attachment.filename,
        }));
      }

      for (const [headerName, headerValue] of Object.entries(headers)) {
        messageParameters[`h:${headerName}`] = headerValue;
      }

      return this.client.messages.create(EMAIL_MAILBOX_DOMAIN, messageParameters);
    } catch (error) {
      await logEmailServiceError('sendEmailFromAddress', error, {
        bccCount: bcc.length,
        ccCount: cc.length,
        from: from.address,
        subject,
        attachmentsCount: attachments.length,
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

  async createOrUpdateContact(
    address: EmailAddress,
  ): Promise<EmailAddressReferenceDocument> {
    try {
      const dbClient = await clientPromise;
      const db = dbClient.db();
      const mailbox = await db
        .collection<EmailMailbox>(DbTables.emailMailboxes)
        .findOne({ normalizedAddress: address.normalizedAddress });

      if (mailbox) {
        return mailbox;
      }

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

  async getOrCreateMailboxForAddress(
    address: EmailAddress,
  ): Promise<EmailMailbox> {
    try {
      const dbClient = await clientPromise;
      const db = dbClient.db();
      const existingMailbox = await db
        .collection<EmailMailbox>(DbTables.emailMailboxes)
        .findOne({ normalizedAddress: address.normalizedAddress });

      if (existingMailbox) {
        return existingMailbox;
      }

      const now = new Date();
      const mailbox: EmailMailbox = {
        _id: new ObjectId(),
        address: address.address,
        normalizedAddress: address.normalizedAddress,
        ...(address.name !== undefined && address.name.length > 0
          ? { displayName: address.name }
          : {}),
        createdAt: now,
        updatedAt: now,
      };

      await db
        .collection<EmailMailbox>(DbTables.emailMailboxes)
        .insertOne(mailbox);

      return mailbox;
    } catch (error) {
      await logEmailServiceError('getOrCreateMailboxForAddress', error, {
        address: address.address,
        normalizedAddress: address.normalizedAddress,
      });

      throw error;
    }
  }

  async createAttachmentReferences(
    attachments: IncomingMailgunAttachment[],
    contentIdsByAttachmentField: Map<string, string>,
  ): Promise<EmailAttachmentDocument[]> {
    try {
      if (attachments.length === 0) {
        return [];
      }

      const attachmentDocuments: EmailAttachmentDocument[] = attachments.map(
        (attachment) => {
          const contentId = contentIdsByAttachmentField.get(
            attachment.fieldName,
          );

          return {
            _id: new ObjectId(),
            filename: attachment.fileName,
            contentType: attachment.contentType,
            sizeBytes: attachment.sizeBytes,
            disposition: contentId === undefined ? 'attachment' : 'inline',
            ...(contentId === undefined ? {} : { contentId }),
          };
        },
      );
      const dbClient = await clientPromise;
      const db = dbClient.db();

      await db
        .collection<EmailAttachmentDocument>(DbTables.emailAttachments)
        .insertMany(attachmentDocuments);

      return attachmentDocuments;
    } catch (error) {
      await logEmailServiceError('createAttachmentReferences', error, {
        attachmentsCount: attachments.length,
      });

      throw error;
    }
  }

  async findThreadIdForIncomingReply(
    inReplyTo: string | undefined,
    references: string[],
  ): Promise<ObjectId | null> {
    const candidateMessageIds = [
      ...(inReplyTo === undefined ? [] : [inReplyTo]),
      ...references.toReversed(),
    ];

    if (candidateMessageIds.length === 0) {
      return null;
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();
    const messages = await db
      .collection<EmailMessageDocument>(DbTables.emailMessages)
      .find({ messageId: { $in: candidateMessageIds } })
      .project<Pick<EmailMessageDocument, 'messageId' | 'threadId'>>({
        messageId: 1,
        threadId: 1,
      })
      .toArray();
    const messagesByMessageId = new Map(
      messages.map((message) => [message.messageId, message]),
    );
    const matchedMessage = candidateMessageIds
      .map((messageId) => messagesByMessageId.get(messageId))
      .find((message) => message !== undefined);

    return matchedMessage?.threadId ?? null;
  }

  async getReadMessageIds(
    messageIds: ObjectId[],
    userId: string,
  ): Promise<Set<string>> {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user id.');
    }

    if (messageIds.length === 0) {
      return new Set<string>();
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();
    const readStates = await db
      .collection<EmailReadStateDocument>(DbTables.emailRead)
      .find({
        userId: new ObjectId(userId),
        messageId: { $in: messageIds },
      })
      .project<Pick<EmailReadStateDocument, 'messageId'>>({ messageId: 1 })
      .toArray();

    return new Set(
      readStates.map((readState) => readState.messageId.toString()),
    );
  }

  async markThreadMessagesAsRead(
    threadId: string,
    userId: string,
  ): Promise<void> {
    if (!ObjectId.isValid(threadId)) {
      throw new Error('Invalid thread id.');
    }

    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user id.');
    }

    const dbClient = await clientPromise;
    const db = dbClient.db();
    const messages = await db
      .collection<EmailMessageDocument>(DbTables.emailMessages)
      .find({
        threadId: new ObjectId(threadId),
        direction: 'incoming',
      })
      .project<Pick<EmailMessageDocument, '_id'>>({ _id: 1 })
      .toArray();

    if (messages.length === 0) {
      return;
    }

    const now = new Date();
    const readUserId = new ObjectId(userId);

    await db.collection<EmailReadStateDocument>(DbTables.emailRead).bulkWrite(
      messages.map((message) => ({
        updateOne: {
          filter: {
            messageId: message._id,
            userId: readUserId,
          },
          update: {
            $set: {
              lastReadAt: now,
              updatedAt: now,
            },
            $setOnInsert: {
              _id: new ObjectId(),
              messageId: message._id,
              userId: readUserId,
              firstReadAt: now,
              createdAt: now,
            },
          },
          upsert: true,
        },
      })),
    );
  }

  async processIncomingMailgunEmail(
    payload: IncomingMailgunEmailPayload,
  ): Promise<IncomingMailgunEmailResult> {
    try {
      const headers = parseMailgunHeaders(
        getMailgunField(payload.fields, 'message-headers'),
      );
      const mailboxRecipients = parseIncomingMailboxRecipients(
        payload.fields,
        headers,
      );
      const mailboxes = await Promise.all(
        mailboxRecipients.map((recipient) =>
          this.getOrCreateMailboxForAddress(recipient),
        ),
      );
      const mailbox = mailboxes[0];
      const from = parseEmailAddress(
        getMailgunField(payload.fields, 'from') ??
          getHeaderValue(headers, 'From') ??
          getMailgunField(payload.fields, 'sender') ??
          '',
      );
      const senderField = getMailgunField(payload.fields, 'sender');
      const sender =
        senderField === undefined || senderField.trim().length === 0
          ? undefined
          : parseEmailAddress(senderField);
      const to = parseOptionalAddressList(
        getHeaderValue(headers, 'To') ?? getMailgunField(payload.fields, 'To'),
      );
      const cc = parseOptionalAddressList(
        getHeaderValue(headers, 'Cc') ?? getMailgunField(payload.fields, 'Cc'),
      );
      const bcc = parseOptionalAddressList(
        getHeaderValue(headers, 'Bcc') ?? getMailgunField(payload.fields, 'Bcc'),
      );
      const replyTo = parseOptionalAddressList(
        getHeaderValue(headers, 'Reply-To') ??
          getMailgunField(payload.fields, 'Reply-To'),
      );
      const normalizedTo =
        to.length > 0
          ? to
          : mailboxRecipients;
      const messageId = normalizeMessageId(
        getHeaderValue(headers, 'Message-ID') ??
          getHeaderValue(headers, 'Message-Id') ??
          getMailgunField(payload.fields, 'Message-Id', 'Message-ID') ??
          '',
      );
      const dbClient = await clientPromise;
      const db = dbClient.db();
      const existingMessage = await db
        .collection<EmailMessageDocument>(DbTables.emailMessages)
        .findOne({ messageId });

      if (existingMessage) {
        return {
          messageId,
          mailboxId: mailbox._id.toString(),
          threadId: existingMessage.threadId.toString(),
          messageDbId: existingMessage._id.toString(),
          duplicate: true,
        };
      }

      const inReplyToHeader = getHeaderValue(headers, 'In-Reply-To');
      const inReplyTo =
        inReplyToHeader === undefined
          ? undefined
          : normalizeMessageId(inReplyToHeader);
      const references = parseReferences(getHeaderValue(headers, 'References'));
      const attachmentDocuments = await this.createAttachmentReferences(
        payload.attachments,
        parseContentIdMap(getMailgunField(payload.fields, 'content-id-map')),
      );
      const contacts = await Promise.all(
        [
          from,
          ...(sender === undefined ? [] : [sender]),
          ...replyTo,
          ...normalizedTo,
          ...cc,
          ...bcc,
        ].map((address) => this.createOrUpdateContact(address)),
      );
      const fromContact = contacts[0];
      const senderContact = sender === undefined ? undefined : contacts[1];
      const replyToStart = sender === undefined ? 1 : 2;
      const toStart = replyToStart + replyTo.length;
      const ccStart = toStart + normalizedTo.length;
      const bccStart = ccStart + cc.length;
      const replyToContacts = contacts.slice(replyToStart, toStart);
      const toContacts = contacts.slice(toStart, ccStart);
      const ccContacts = contacts.slice(ccStart, bccStart);
      const bccContacts = contacts.slice(bccStart);
      const participantIds = getExternalParticipantIds([
        fromContact,
        ...toContacts,
        ...ccContacts,
        ...bccContacts,
      ]);
      const now = new Date();
      const messageObjectId = new ObjectId();
      const existingThreadId = await this.findThreadIdForIncomingReply(
        inReplyTo,
        references,
      );
      const threadId = existingThreadId ?? new ObjectId();
      const subject =
        getMailgunField(payload.fields, 'subject') ??
        getHeaderValue(headers, 'Subject') ??
        '';
      const textContent =
        getMailgunField(payload.fields, 'stripped-text') ??
        getMailgunField(payload.fields, 'body-plain') ??
        '';
      const htmlContent =
        getMailgunField(payload.fields, 'stripped-html') ??
        getMailgunField(payload.fields, 'body-html');
      const message: EmailMessageDocument = {
        _id: messageObjectId,
        messageId,
        threadId,
        ...(inReplyTo === undefined ? {} : { inReplyTo }),
        ...(references.length === 0 ? {} : { references }),
        direction: 'incoming',
        from: fromContact._id,
        ...(senderContact === undefined ? {} : { sender: senderContact._id }),
        ...(replyToContacts.length === 0
          ? {}
          : { replyTo: replyToContacts.map((contact) => contact._id) }),
        to: toContacts.map((contact) => contact._id),
        cc: ccContacts.map((contact) => contact._id),
        bcc: bccContacts.map((contact) => contact._id),
        subject,
        content: {
          ...(textContent.length > 0 ? { text: textContent } : {}),
          ...(htmlContent !== undefined && htmlContent.length > 0
            ? { html: htmlContent }
            : {}),
          ...(textContent.length === 0 &&
          (htmlContent === undefined || htmlContent.length === 0)
            ? { text: '' }
            : {}),
        },
        attachments: attachmentDocuments.map((attachment) => attachment._id),
        headers,
        source: {
          protocol: 'SMTP',
          provider: 'mailgun',
          ...(payload.remoteIp === undefined ? {} : { remoteIp: payload.remoteIp }),
        },
        dates: {
          headerDate: parseHeaderDate(getHeaderValue(headers, 'Date')),
          receivedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      };

      if (existingThreadId === null) {
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
      } else {
        await db.collection<EmailThreadDocument>(DbTables.emailThreads).updateOne(
          { _id: threadId },
          {
            $addToSet: {
              participants: {
                $each: participantIds,
              },
            },
            $inc: {
              messageCount: 1,
            },
            $set: {
              lastMessageId: messageObjectId,
              updatedAt: now,
            },
          },
        );
      }

      await db.collection<EmailMessageDocument>(DbTables.emailMessages).insertOne(message);

      return {
        messageId,
        mailboxId: mailbox._id.toString(),
        threadId: threadId.toString(),
        messageDbId: messageObjectId.toString(),
        duplicate: false,
      };
    } catch (error) {
      await logEmailServiceError('processIncomingMailgunEmail', error, {
        attachmentCount: payload.attachments.length,
        fieldNames: Object.keys(payload.fields).join(','),
        recipient: getMailgunField(payload.fields, 'recipient'),
        recipientCount:
          getMailgunField(payload.fields, 'recipient') === undefined
            ? undefined
            : (getMailgunField(payload.fields, 'recipient') ?? '')
              .split(/[\n,;](?=(?:[^"]*"[^"]*")*[^"]*$)/)
              .filter((entry) => entry.trim().length > 0).length,
        subject: getMailgunField(payload.fields, 'subject'),
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

      const to = parseEmailRecipientInputs(payload.to);
      const cc = parseEmailRecipientInputs(payload.cc);
      const bcc = parseEmailRecipientInputs(payload.bcc);

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
      const threadId = new ObjectId();
      const messageObjectId = new ObjectId();
      const messageId = createMessageId();
      const attachmentFolder = createEmailAttachmentFolder(threadId.toString());
      const uploadedAttachments = payload.attachments.length === 0
        ? []
        : await (await import('./r2.service')).r2Service.uploadFiles(
          payload.attachments,
          { folder: attachmentFolder },
        );
      const emailAttachments = await Promise.all(
        payload.attachments.map(async (attachment) => ({
          data: Buffer.from(await attachment.arrayBuffer()),
          filename: attachment.name,
          contentType: attachment.type || 'application/octet-stream',
        })),
      );
      const result = await this.sendEmailFromAddress(
        from,
        to,
        cc,
        bcc,
        subject,
        bodyHtml,
        emailAttachments,
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
      const participantIds = getExternalParticipantIds(contacts);
      const now = new Date();
      const attachmentDocuments: EmailAttachmentDocument[] =
        uploadedAttachments.map((attachment) => ({
          _id: new ObjectId(),
          filename: attachment.originalName,
          contentType: attachment.mimeType || 'application/octet-stream',
          sizeBytes: attachment.size,
          disposition: 'attachment',
          storageKey: attachment.key,
        }));
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
      if (attachmentDocuments.length > 0) {
        await db
          .collection<EmailAttachmentDocument>(DbTables.emailAttachments)
          .insertMany(attachmentDocuments);
      }
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
        attachments: attachmentDocuments.map((attachment) => attachment._id),
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

      await db.collection(DbTables.emailMessages).insertOne(message);

      const contactsById = new Map(
        contacts.map((contact) => [
          contact._id.toString(),
          mapAddressReference(contact),
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
        attachmentsCount: payload.attachments.length,
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

  async sendMailboxThreadReply(
    payload: SendMailboxThreadReplyPayload,
  ): Promise<SendMailboxThreadReplyResult> {
    try {
      if (!ObjectId.isValid(payload.mailboxId)) {
        throw new Error('Invalid mailbox id.');
      }

      if (!ObjectId.isValid(payload.threadId)) {
        throw new Error('Invalid thread id.');
      }

      const bodyHtml = payload.bodyHtml.trim();

      if (stripHtml(bodyHtml).length === 0) {
        throw new Error('Email body is required.');
      }

      const to = parseEmailRecipientInputs(payload.to);
      const cc = parseEmailRecipientInputs(payload.cc);
      const bcc = parseEmailRecipientInputs(payload.bcc);

      if (to.length === 0) {
        throw new Error('At least one recipient email is required.');
      }

      const mailboxObjectId = new ObjectId(payload.mailboxId);
      const threadObjectId = new ObjectId(payload.threadId);
      const dbClient = await clientPromise;
      const db = dbClient.db();
      const [mailbox, thread] = await Promise.all([
        db
          .collection<EmailMailbox>(DbTables.emailMailboxes)
          .findOne({ _id: mailboxObjectId }),
        db
          .collection<EmailThreadDocument>(DbTables.emailThreads)
          .findOne({ _id: threadObjectId }),
      ]);

      if (!mailbox) {
        throw new Error('Mailbox not found.');
      }

      if (!thread || !thread.mailboxId.equals(mailboxObjectId)) {
        throw new Error('Thread not found.');
      }

      const subject = thread.subject;
      const previousMessage = await db
        .collection<EmailMessageDocument>(DbTables.emailMessages)
        .findOne({ _id: thread.lastMessageId });
      const from: EmailAddress = {
        ...(mailbox.displayName !== undefined && mailbox.displayName.length > 0
          ? { name: mailbox.displayName }
          : {}),
        address: mailbox.address,
        normalizedAddress: mailbox.normalizedAddress,
      };
      const messageId = createMessageId();
      const references = [
        ...(previousMessage?.references ?? []),
        ...(previousMessage === null || previousMessage === undefined
          ? []
          : [previousMessage.messageId]),
      ];
      const headers = {
        'Message-ID': messageId,
        ...(previousMessage === null || previousMessage === undefined
          ? {}
          : { 'In-Reply-To': previousMessage.messageId }),
        ...(references.length === 0
          ? {}
          : { References: references.join(' ') }),
      };
      const result = await this.sendEmailFromAddress(
        from,
        to,
        cc,
        bcc,
        subject,
        bodyHtml,
        payload.attachments,
        headers,
      );

      if (result.status !== 200) {
        throw new Error('Failed to send email.');
      }

      const attachmentDocuments: EmailAttachmentDocument[] =
        payload.attachments.map((attachment) => ({
          _id: new ObjectId(),
          filename: attachment.filename,
          contentType: 'application/octet-stream',
          sizeBytes: attachment.data.length,
          disposition: 'attachment',
        }));

      if (attachmentDocuments.length > 0) {
        await db
          .collection<EmailAttachmentDocument>(DbTables.emailAttachments)
          .insertMany(attachmentDocuments);
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
      const participantIds = getExternalParticipantIds(contacts);
      const now = new Date();
      const messageObjectId = new ObjectId();
      const message: EmailMessageDocument = {
        _id: messageObjectId,
        messageId,
        threadId: threadObjectId,
        ...(previousMessage === null || previousMessage === undefined
          ? {}
          : { inReplyTo: previousMessage.messageId }),
        ...(references.length === 0 ? {} : { references }),
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
        attachments: attachmentDocuments.map((attachment) => attachment._id),
        headers,
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

      await db
        .collection<EmailMessageDocument>(DbTables.emailMessages)
        .insertOne(message);
      await db.collection<EmailThreadDocument>(DbTables.emailThreads).updateOne(
        { _id: threadObjectId },
        {
          $addToSet: {
            participants: {
              $each: participantIds,
            },
          },
          $inc: {
            messageCount: 1,
          },
          $set: {
            lastMessageId: messageObjectId,
            updatedAt: now,
          },
        },
      );

      const contactsById = new Map(
        contacts.map((contact) => [
          contact._id.toString(),
          mapAddressReference(contact),
        ]),
      );

      return {
        message: mapMessage(message, contactsById),
      };
    } catch (error) {
      await logEmailServiceError('sendMailboxThreadReply', error, {
        attachmentsCount: payload.attachments.length,
        bccLength: payload.bcc.length,
        bodyHtmlLength: payload.bodyHtml.length,
        ccLength: payload.cc.length,
        mailboxId: payload.mailboxId,
        threadId: payload.threadId,
        toLength: payload.to.length,
      });

      throw error;
    }
  }

  async forwardMailboxMessage(
    payload: ForwardMailboxMessagePayload,
  ): Promise<SendMailboxThreadReplyResult> {
    try {
      if (!ObjectId.isValid(payload.mailboxId)) {
        throw new Error('Invalid mailbox id.');
      }

      if (!ObjectId.isValid(payload.messageId)) {
        throw new Error('Invalid message id.');
      }

      const recipient = parseEmailAddress(payload.recipient);
      const mailboxObjectId = new ObjectId(payload.mailboxId);
      const messageObjectId = new ObjectId(payload.messageId);
      const dbClient = await clientPromise;
      const db = dbClient.db();
      const [mailbox, sourceMessage] = await Promise.all([
        db
          .collection<EmailMailbox>(DbTables.emailMailboxes)
          .findOne({ _id: mailboxObjectId }),
        db
          .collection<EmailMessageDocument>(DbTables.emailMessages)
          .findOne({ _id: messageObjectId }),
      ]);

      if (!mailbox) {
        throw new Error('Mailbox not found.');
      }

      if (!sourceMessage) {
        throw new Error('Message not found.');
      }

      const thread = await db
        .collection<EmailThreadDocument>(DbTables.emailThreads)
        .findOne({
          _id: sourceMessage.threadId,
          mailboxId: mailboxObjectId,
        });

      if (!thread) {
        throw new Error('Thread not found.');
      }

      const sourceContactsById = await getContactsById([
        ...getContactIds([sourceMessage.from, sourceMessage.sender]),
        ...getContactIds(sourceMessage.replyTo ?? []),
        ...getContactIds(sourceMessage.to),
        ...getContactIds(sourceMessage.cc ?? []),
        ...getContactIds(sourceMessage.bcc ?? []),
      ]);
      const sourceSummary = mapMessage(sourceMessage, sourceContactsById);
      const bodyHtml = createForwardedEmailHtml(sourceSummary);
      const subject = /^fwd:/i.test(sourceMessage.subject)
        ? sourceMessage.subject
        : `Fwd: ${sourceMessage.subject}`;
      const from: EmailAddress = {
        ...(mailbox.displayName !== undefined && mailbox.displayName.length > 0
          ? { name: mailbox.displayName }
          : {}),
        address: mailbox.address,
        normalizedAddress: mailbox.normalizedAddress,
      };
      const messageId = createMessageId();
      const references = [
        ...(sourceMessage.references ?? []),
        sourceMessage.messageId,
      ];
      const headers = {
        'Message-ID': messageId,
        'In-Reply-To': sourceMessage.messageId,
        References: references.join(' '),
      };
      const result = await this.sendEmailFromAddress(
        from,
        [recipient],
        [],
        [],
        subject,
        bodyHtml,
        [],
        headers,
      );

      if (result.status !== 200) {
        throw new Error('Failed to forward email.');
      }

      const recipientReference = await this.createOrUpdateContact(recipient);
      const now = new Date();
      const forwardedMessageObjectId = new ObjectId();
      const forwardedMessage: EmailMessageDocument = {
        _id: forwardedMessageObjectId,
        messageId,
        threadId: thread._id,
        inReplyTo: sourceMessage.messageId,
        references,
        direction: 'outgoing',
        from: mailbox._id,
        to: [recipientReference._id],
        cc: [],
        bcc: [],
        subject,
        content: {
          text: stripHtml(bodyHtml),
          html: bodyHtml,
        },
        attachments: [],
        headers,
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

      await db
        .collection<EmailMessageDocument>(DbTables.emailMessages)
        .insertOne(forwardedMessage);
      await db.collection<EmailThreadDocument>(DbTables.emailThreads).updateOne(
        { _id: thread._id },
        {
          ...(getExternalParticipantIds([recipientReference]).length === 0
            ? {}
            : {
              $addToSet: {
                participants: recipientReference._id,
              },
            }),
          $inc: {
            messageCount: 1,
          },
          $set: {
            lastMessageId: forwardedMessageObjectId,
            updatedAt: now,
          },
        },
      );

      const referencesById = new Map([
        [mailbox._id.toString(), mapAddressReference(mailbox)],
        [
          recipientReference._id.toString(),
          mapAddressReference(recipientReference),
        ],
      ]);

      return {
        message: mapMessage(forwardedMessage, referencesById),
      };
    } catch (error) {
      await logEmailServiceError('forwardMailboxMessage', error, {
        mailboxId: payload.mailboxId,
        messageId: payload.messageId,
        recipient: payload.recipient,
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

  async listMessagesByThread(
    threadId: string,
    userId: string,
  ): Promise<EmailMessageSummary[]> {
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
      const readMessageIds = await this.getReadMessageIds(
        messages
          .filter((message) => message.direction === 'incoming')
          .map((message) => message._id),
        userId,
      );

      return messages.map((message) =>
        mapMessage(message, contactsById, readMessageIds),
      );
    } catch (error) {
      await logEmailServiceError('listMessagesByThread', error, {
        threadId,
      });

      throw error;
    }
  }

  async listMailboxThreadGroups(
    userId: string,
  ): Promise<EmailMailboxThreadGroup[]> {
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
      const incomingMessages = threads.length > 0
        ? await db
          .collection<EmailMessageDocument>(DbTables.emailMessages)
          .find({
            threadId: { $in: threads.map((thread) => thread._id) },
            direction: 'incoming',
          })
          .project<Pick<EmailMessageDocument, '_id' | 'threadId'>>({
            _id: 1,
            threadId: 1,
          })
          .toArray()
        : [];
      const readMessageIds = await this.getReadMessageIds(
        incomingMessages.map((message) => message._id),
        userId,
      );
      const unreadThreadIds = new Set(
        incomingMessages
          .filter((message) => !readMessageIds.has(message._id.toString()))
          .map((message) => message.threadId.toString()),
      );

      for (const thread of threads) {
        const mailboxId = thread.mailboxId.toString();
        const mailboxThreads = threadsByMailboxId.get(mailboxId) ?? [];

        mailboxThreads.push(
          mapThread(thread, contactsById, lastMessagesById, unreadThreadIds),
        );
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
