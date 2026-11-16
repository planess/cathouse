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
import type { ThreadMessageStats } from './types/thread-message-stats';

/**
 * Maps a thread document to its summary.
 *
 * @param thread - Thread document.
 * @param contactsById - Contacts used to resolve participant references.
 * @param lastMessagesById - Last messages of threads, keyed by message id.
 * @param unreadThreadIds - Ids of threads with unread messages.
 * @param messageStatsById - Counters aggregated across all thread messages,
 * keyed by thread id. When omitted, the counters are derived from the last
 * message only (correct for a thread that has just one message).
 */
export function mapThread(
  thread: EmailThreadDocument,
  contactsById: Map<string, EmailAddressSummary>,
  lastMessagesById = new Map<string, EmailMessageDocument>(),
  unreadThreadIds = new Set<string>(),
  messageStatsById?: Map<string, ThreadMessageStats>,
): EmailThreadSummary {
  const participantIds = getContactIds(thread.participants);
  const lastMessage = lastMessagesById.get(thread.lastMessageId.toString());
  const stats: ThreadMessageStats =
    messageStatsById === undefined
      ? {
        attachmentsCount: getMessageAttachmentsCount(lastMessage),
        incomingCount: lastMessage?.direction === 'incoming' ? 1 : 0,
        outgoingCount: lastMessage?.direction === 'outgoing' ? 1 : 0,
      }
      : (messageStatsById.get(thread._id.toString()) ?? {
        attachmentsCount: 0,
        incomingCount: 0,
        outgoingCount: 0,
      });

  return {
    id: thread._id.toString(),
    mailboxId: thread.mailboxId.toString(),
    subject: thread.subject,
    participants: thread.participants.map((participant) =>
      mapAddress(participant, contactsById),
    ),
    participantIds,
    messageCount: thread.messageCount,
    incomingCount: stats.incomingCount,
    outgoingCount: stats.outgoingCount,
    hasUnreadMessages: unreadThreadIds.has(thread._id.toString()),
    preview: getMessagePreview(lastMessage),
    attachmentsCount: stats.attachmentsCount,
    lastMessageId: thread.lastMessageId.toString(),
    lastMessageDate:
      getMessageDate(lastMessage) || toIsoString(thread.updatedAt),
    createdAt: toIsoString(thread.createdAt),
    updatedAt: toIsoString(thread.updatedAt),
  };
}
