'use server';

import { Decimal128 } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import { normalizeText } from '../helpers/common';

import type { AccountPayload } from '../types/payloads';

export async function createAccount(payload: AccountPayload) {
  const name = normalizeText(payload.name);
  const iban = normalizeText(payload.iban);

  if (!name || !iban) {
    return { success: false, message: 'Name and IBAN are required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const insertResult = await db.collection(DbTables.bankAccounts).insertOne({
    name,
    iban,
    balance: Decimal128.fromString('0'),
    isActive: true,
    createdAt: new Date(),
  });

  revalidatePath('/admin/finance');

  return {
    success: true,
    message: 'Account created.',
    accountId: insertResult.insertedId.toString(),
  };
}
