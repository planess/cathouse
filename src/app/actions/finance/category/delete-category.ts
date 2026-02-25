'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { toObjectId } from '@app/helpers/to-object-id';
import clientPromise from '@app/ins/mongo-client';

import type { CategoryPayload } from '../types/payloads';

export async function deleteCategory(payload: CategoryPayload) {
  const categoryIdText = payload.id ?? '';

  if (!ObjectId.isValid(categoryIdText)) {
    return { success: false, message: 'Invalid category id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const categoryId = toObjectId(categoryIdText);
  const collectionName = DbTables.financeCategories;

  if (!categoryId) {
    return { success: false, message: 'Category not found.' };
  }

  const categories = await db
    .collection<{ _id: ObjectId; inherits?: ObjectId }>(collectionName)
    .find({}, { projection: { _id: 1, inherits: 1 } })
    .toArray();

  const childrenByParentId = new Map<string, string[]>();

  categories.forEach((category) => {
    const parentId = category.inherits?.toString();

    if (parentId === undefined) {
      return;
    }

    const current = childrenByParentId.get(parentId) ?? [];
    current.push(category._id.toString());
    childrenByParentId.set(parentId, current);
  });

  const idsToDeactivate = new Set<string>();
  const queue = [categoryId.toString()];

  while (queue.length > 0) {
    const currentId = queue.shift();

    if (currentId === undefined || idsToDeactivate.has(currentId)) {
      continue;
    }

    idsToDeactivate.add(currentId);

    const children = childrenByParentId.get(currentId) ?? [];
    children.forEach((childId) => {
      if (!idsToDeactivate.has(childId)) {
        queue.push(childId);
      }
    });
  }

  const objectIds = [...idsToDeactivate]
    .map((id) => toObjectId(id))
    .filter<ObjectId>((id) => id !== null);

  if (objectIds.length === 0) {
    return { success: false, message: 'Category not found.' };
  }

  await db.collection(collectionName).updateMany(
    { _id: { $in: objectIds } },
    {
      $set: {
        active: false,
      },
    },
  );

  revalidatePath('/admin/finance');

  return { success: true, message: 'Category deactivated.' };
}
