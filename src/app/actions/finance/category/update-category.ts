'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { toObjectId } from '@app/helpers/to-object-id';
import clientPromise from '@app/ins/mongo-client';

import { normalizeText } from '../helpers/common';

import type { CategoryPayload } from '../types/payloads';
import type { ActionResult } from '../types/response';

export async function updateCategory(
  payload: CategoryPayload,
): Promise<ActionResult> {
  const categoryIdText = payload.id ?? '';

  if (!ObjectId.isValid(categoryIdText)) {
    return { success: false, message: 'Invalid category id.' };
  }

  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }

  const categoryId = toObjectId(categoryIdText);
  const inheritsId = toObjectId(payload.inheritsId);

  if (categoryId === null) {
    return { success: false, message: 'Category not found.' };
  }

  if (inheritsId?.equals(categoryId) === true) {
    return {
      success: false,
      message: 'Category cannot inherit from itself.',
    };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const existing = await db
    .collection(DbTables.financeCategories)
    .findOne({ _id: categoryId });

  if (!existing) {
    return { success: false, message: 'Category not found.' };
  }

  if (inheritsId) {
    const parentExists = await db
      .collection(DbTables.financeCategories)
      .findOne({ _id: inheritsId });

    if (!parentExists) {
      return { success: false, message: 'Parent category not found.' };
    }
  }

  const update: { $set: Record<string, unknown>; $unset?: Record<string, ''> } =
    {
      $set: {
        name,
        active: payload.active ?? true,
      },
    };

  if (inheritsId) {
    update.$set.inherits = inheritsId;
  } else {
    update.$unset = { inherits: '' };
  }

  await db
    .collection(DbTables.financeCategories)
    .updateOne({ _id: categoryId }, update);

  revalidatePath('/admin/finance');

  return { success: true, message: 'Category updated.' };
}
