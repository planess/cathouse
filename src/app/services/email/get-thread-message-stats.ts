import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import type { EmailMessageDocument, EmailThreadDocument } from './document-types';
import type { ThreadMessageStats } from './types/thread-message-stats';
import type { ObjectId } from 'mongodb';

/**
 * Aggregation condition, evaluated per `$$attachment` of a message, that is
 * true when the attachment is shown inside the message body: it has a content
 * ID and the HTML references it as `cid:<content ID>`. Matches the rule the
 * message view uses to leave such files out of its attachment list.
 */
const INLINE_IN_BODY = {
  $let: {
    vars: {
      document: {
        $arrayElemAt: [
          {
            $filter: {
              input: '$attachmentDocuments',
              as: 'document',
              cond: { $eq: ['$$document._id', '$$attachment'] },
            },
          },
          0,
        ],
      },
    },
    in: {
      $let: {
        vars: {
          // Older messages embed the attachment reference itself.
          contentId: {
            $ifNull: ['$$document.contentId', '$$attachment.contentId'],
          },
        },
        in: {
          $cond: [
            { $eq: [{ $type: '$$contentId' }, 'string'] },
            {
              $gte: [
                {
                  $indexOfCP: [
                    {
                      $concat: [
                        { $ifNull: ['$content.html', ''] },
                        { $ifNull: ['$content.stripped-html', ''] },
                      ],
                    },
                    { $concat: ['cid:', '$$contentId'] },
                  ],
                },
                0,
              ],
            },
            false,
          ],
        },
      },
    },
  },
};

/**
 * Aggregates message counters for each thread: incoming and outgoing message
 * counts and the number of unique attachments across all messages. Files shown
 * inline in a message body are not counted.
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
        $lookup: {
          from: DbTables.emailAttachments,
          localField: 'attachments',
          foreignField: '_id',
          as: 'attachmentDocuments',
        },
      },
      {
        $group: {
          _id: '$threadId',
          incomingCount: {
            $sum: { $cond: [{ $eq: ['$direction', 'incoming'] }, 1, 0] },
          },
          outgoingCount: {
            $sum: { $cond: [{ $eq: ['$direction', 'outgoing'] }, 1, 0] },
          },
          attachmentLists: {
            $push: {
              $filter: {
                input: { $ifNull: ['$attachments', []] },
                as: 'attachment',
                cond: { $not: [INLINE_IN_BODY] },
              },
            },
          },
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
