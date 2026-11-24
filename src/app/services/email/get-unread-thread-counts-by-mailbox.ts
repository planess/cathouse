import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import { createUnreadIncomingMessageStages } from './create-unread-incoming-message-stages';

import type { EmailMessageDocument } from './document-types';

/**
 * Counts, per mailbox, the threads that contain at least one incoming message
 * the user has not read yet. A message is read when the `email_read`
 * collection holds a read state for it and the user; outgoing messages are
 * always treated as read.
 *
 * @param userId - Id of the user whose read states are checked.
 * @returns Map of mailbox id to its unread thread count; mailboxes without
 * unread threads are absent from the map.
 */
export async function getUnreadThreadCountsByMailbox(
  userId: string,
): Promise<Map<string, number>> {
  if (!ObjectId.isValid(userId)) {
    throw new Error('Invalid user id.');
  }

  const readerId = new ObjectId(userId);
  const dbClient = await clientPromise;
  const db = dbClient.db();
  const rows = await db
    .collection<EmailMessageDocument>(DbTables.emailMessages)
    .aggregate<{ _id: ObjectId; unreadThreadsCount: number }>([
      ...createUnreadIncomingMessageStages(readerId),
      { $group: { _id: '$threadId' } },
      {
        $lookup: {
          from: DbTables.emailThreads,
          localField: '_id',
          foreignField: '_id',
          as: 'thread',
        },
      },
      { $unwind: '$thread' },
      {
        $group: {
          _id: '$thread.mailboxId',
          unreadThreadsCount: { $sum: 1 },
        },
      },
    ])
    .toArray();

  return new Map(
    rows.map(({ _id, unreadThreadsCount }) => [
      _id.toString(),
      unreadThreadsCount,
    ]),
  );
}
