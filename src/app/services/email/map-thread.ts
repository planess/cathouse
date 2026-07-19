import { toIsoString } from './date-helpers';
import { getContactIds } from './get-contact-ids';
import { getMessageAttachmentsCount } from './get-message-attachments-count';
import { getMessageDate } from './get-message-date';
import { getMessagePreview } from './get-message-preview';
import { mapAddress } from './map-address';

import type {
  EmailMessageDocument,
  EmailThreadDocument,
} from './document-types';
import type { EmailAddressSummary } from './types/email-address-summary';
import type { EmailThreadSummary } from './types/email-thread-summary';

export function mapThread(
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
