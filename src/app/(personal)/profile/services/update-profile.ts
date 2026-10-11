import type { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { Profile } from '@app/models/db/profile';

/**
 * Writes fields of a user's document in the `profiles` collection.
 *
 * @param userID - Owner of the profile; the profile shares the user's `_id`.
 * @param set - Fields to set.
 * @param unset - Fields to remove.
 */
export async function updateProfile(
  userID: ObjectId,
  set: Partial<Omit<Profile, '_id'>>,
  unset: (keyof Omit<Profile, '_id'>)[] = [],
): Promise<void> {
  const dbClient = await clientPromise;

  await dbClient
    .db()
    .collection<Profile>(DbTables.profiles)
    .updateOne(
      { _id: userID },
      {
        $set: set,
        ...(unset.length > 0 && {
          $unset: Object.fromEntries(unset.map((key) => [key, ''])),
        }),
      },
      { upsert: true },
    );
}
