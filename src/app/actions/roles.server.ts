'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';

export type RolePayload = {
  id?: string;
  name: string;
  description: string;
  inheritsFrom: string[];
  permissions: string[];
};

function toObjectIds(values: string[]): ObjectId[] {
  return values
    .map((value) => value.trim())
    .filter((value) => ObjectId.isValid(value))
    .map((value) => new ObjectId(value));
}

function normalizeText(value?: string): string {
  return value?.trim() ?? '';
}

export async function createRole(payload: RolePayload) {
  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Role name is required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const currentUser = await getCurrentUser();

  const insertResult = await db.collection(DbTables.roles).insertOne({
    name,
    description: normalizeText(payload.description),
    permissions: toObjectIds(payload.permissions ?? []),
    inherits: toObjectIds(payload.inheritsFrom ?? []),
    isActive: true,
    createdAt: new Date(),
    ...(currentUser?.id ? { createdBy: currentUser.id } : {}),
  });

  revalidatePath('/admin/roles');

  return {
    success: true,
    message: 'Role created.',
    roleId: insertResult.insertedId.toString(),
  };
}

export async function updateRole(payload: RolePayload) {
  if (!payload.id || !ObjectId.isValid(payload.id)) {
    return { success: false, message: 'Invalid role id.' };
  }

  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Role name is required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection(DbTables.roles).updateOne(
    { _id: new ObjectId(payload.id) },
    {
      $set: {
        name,
        description: normalizeText(payload.description),
        permissions: toObjectIds(payload.permissions ?? []),
        inherits: toObjectIds(payload.inheritsFrom ?? []),
      },
    },
  );

  revalidatePath('/admin/roles');

  return { success: true, message: 'Role updated.' };
}

export async function softDeleteRole(roleId: string) {
  if (!ObjectId.isValid(roleId)) {
    return { success: false, message: 'Invalid role id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db
    .collection(DbTables.roles)
    .updateOne({ _id: new ObjectId(roleId) }, { $set: { isActive: false } });

  revalidatePath('/admin/roles');

  return { success: true, message: 'Role deactivated.' };
}
