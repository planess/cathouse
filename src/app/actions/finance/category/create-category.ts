'use server';

import { Decimal128 } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { toObjectId } from '@app/helpers/to-object-id';
import clientPromise from '@app/ins/mongo-client';

import { normalizeText } from '../helpers/common';

import type { CategoryPayload } from '../types/payloads';

export async function createCategory(payload: CategoryPayload) {
  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }

  const inheritsId = toObjectId(payload.inheritsId);

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection(DbTables.financeCategories).insertOne({
    ...(inheritsId ? { inherits: inheritsId } : {}),
    name,
    active: payload.active ?? true,
    balance: Decimal128.fromString('0'),
    createdAt: new Date(),
  });

  revalidatePath('/admin/finance');

  return {
    success: true,
    message: 'Category created.',
  };
}
