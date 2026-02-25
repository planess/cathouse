'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import { normalizeText } from '../helpers/common';

import type { AccountPayload } from '../types/payloads';

export async function updateAccount(payload: AccountPayload) {
  const accountIdText = payload.id ?? '';

  if (!ObjectId.isValid(accountIdText)) {
    return { success: false, message: 'Invalid account id.' };
  }

  const name = normalizeText(payload.name);
  const iban = normalizeText(payload.iban);

  if (!name || !iban) {
    return { success: false, message: 'Name and IBAN are required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection(DbTables.bankAccounts).updateOne(
    { _id: new ObjectId(accountIdText) },
    {
      $set: {
        name,
        iban,
      },
    },
  );

  revalidatePath('/admin/finance');

  return { success: true, message: 'Account updated.' };
}
