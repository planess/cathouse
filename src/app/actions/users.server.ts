'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

export async function softDeleteUser(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return { success: false, message: 'Invalid user id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db
    .collection(DbTables.users)
    .updateOne({ _id: new ObjectId(userId) }, { $set: { isActive: false } });

  revalidatePath('/admin/users');

  return { success: true, message: 'User deactivated.' };
}
