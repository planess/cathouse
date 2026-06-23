import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import { Profile } from '@app/models/db/profile';
import { User } from '@app/models/db/user';

export type VolunteerRecord = {
  profile: Profile | null;
  user: User;
};

export async function loadVolunteer(
  id: string,
): Promise<VolunteerRecord | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const client = await clientPromise;
  const db = client.db();
  const usersCollection = db.collection<User>(DbTables.users);
  const profilesCollection = db.collection<Profile>(DbTables.profiles);

  const user = await usersCollection.findOne({ _id: new ObjectId(id) });

  if (!user) {
    return null;
  }

  const profile = await profilesCollection.findOne({ _id: user._id });

  return {
    profile,
    user,
  };
}
