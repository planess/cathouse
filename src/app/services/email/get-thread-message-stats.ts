import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import type { EmailMessageDocument, EmailThreadDocument } from './document-types';
import type { ThreadMessageStats } from './types/thread-message-stats';
import type { ObjectId } from 'mongodb';

/**
 * Aggregates message counters for each thread: incoming and outgoing message
 * counts and the number of unique attachments across all messages.
 *
 * An attachment referenced by several messages (for example, when a message is
 * forwarded within the thread) is counted once.
 *
 * @param threads - Threads to aggregate counters for.
 * @returns Map of thread id to its counters; threads without messages are
 * absent from the map.
 */
export async function getThreadMessageStats(
  threads: EmailThreadDocument[],
): Promise<Map<string, ThreadMessageStats>> {
  const threadIds = threads.map((thread) => thread._id);

  if (threadIds.length === 0) {
    return new Map();
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const rows = await db
    .collection<EmailMessageDocument>(DbTables.emailMessages)
    .aggregate<ThreadMessageStats & { _id: ObjectId }>([
      { $match: { threadId: { $in: threadIds } } },
      {
        $group: {
          _id: '$threadId',
          incomingCount: {
            $sum: { $cond: [{ $eq: ['$direction', 'incoming'] }, 1, 0] },
          },
          outgoingCount: {
            $sum: { $cond: [{ $eq: ['$direction', 'outgoing'] }, 1, 0] },
          },
          attachmentLists: { $push: { $ifNull: ['$attachments', []] } },
        },
      },
      {
        $project: {
          incomingCount: 1,
          outgoingCount: 1,
          attachmentsCount: {
            $size: {
              $reduce: {
                input: '$attachmentLists',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] },
              },
            },
          },
        },
      },
    ])
    .toArray();

  return new Map(
    rows.map(({ _id, attachmentsCount, incomingCount, outgoingCount }) => [
      _id.toString(),
      { attachmentsCount, incomingCount, outgoingCount },
    ]),
  );
}
