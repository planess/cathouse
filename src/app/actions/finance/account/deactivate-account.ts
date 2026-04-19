'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

export async function deactivateAccount(accountId: string) {
  if (!ObjectId.isValid(accountId)) {
    return { success: false, message: 'Invalid account id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const collection = db.collection(DbTables.bankAccounts);

  const isUsed = await db
    .collection(DbTables.financeIncomingReports)
    .findOne({ account: new ObjectId(accountId) });

  await (isUsed
    ? collection.updateOne(
        { _id: new ObjectId(accountId) },
        { $set: { isActive: false } },
      )
    : collection.deleteOne({ _id: new ObjectId(accountId) }));

  revalidatePath('/admin/finance');

  return { success: true, message: 'Account deactivated.' };
}
