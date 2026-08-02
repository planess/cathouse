import { toIsoString } from './date-helpers';
import { mapAddress } from './map-address';

import type { EmailMessageDocument } from './document-types';
import type { EmailAddressSummary } from './types/email-address-summary';
import type { EmailMessageSummary } from './types/email-message-summary';

export function mapMessage(
  message: EmailMessageDocument,
  contactsById: Map<string, EmailAddressSummary>,
  readMessageIds = new Set<string>(),
): EmailMessageSummary {
  const cc = message.cc ?? [];
  const bcc = message.bcc ?? [];
  const attachments = message.attachments ?? [];

  return {
    id: message._id.toString(),
    messageId: message.messageId,
    threadId: message.threadId.toString(),
    direction: message.direction,
    isRead:
      message.direction === 'outgoing' || readMessageIds.has(message._id.toString()),
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
