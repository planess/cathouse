import { DbTables } from '@app/enum/db-tables';

import type { ObjectId } from 'mongodb';

/**
 * Builds aggregation stages for the `email_messages` collection that keep only
 * incoming messages without a read state for the given user in `email_read`.
 * Outgoing messages are always treated as read.
 *
 * @param readerId - Id of the user whose read states are checked.
 * @returns Stages to place after any message filter of the pipeline.
 */
export function createUnreadIncomingMessageStages(readerId: ObjectId) {
  return [
    { $match: { direction: 'incoming' } },
    {
      $lookup: {
        from: DbTables.emailRead,
        let: { messageId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$messageId', '$$messageId'] },
                  { $eq: ['$userId', readerId] },
                ],
              },
            },
          },
          { $limit: 1 },
          { $project: { _id: 1 } },
        ],
        as: 'readStates',
      },
    },
    { $match: { readStates: { $size: 0 } } },
  ];
}
