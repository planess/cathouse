'use server';

import { randomBytes } from 'node:crypto';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { hashBlake2 } from '@app/helpers/hash-blake2';
import clientPromise from '@app/ins/mongo-client';

export type UserPayload = {
  id?: string;
  email: string;
  emailVerified: boolean;
  roles: string[];
  isActive: boolean;
};

function toObjectIds(values: string[]): ObjectId[] {
  return values
    .map((value) => value.trim())
    .filter((value) => ObjectId.isValid(value))
    .map((value) => new ObjectId(value));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createUser(payload: UserPayload) {
  const email = normalizeEmail(payload.email);

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const existing = await db.collection(DbTables.users).findOne({ email });

  if (existing) {
    return { success: false, message: 'User with this email already exists.' };
  }

  const tempPassword = randomBytes(24).toString('hex');
  const passwordHash = await hashBlake2(tempPassword, `!!${email}`);

  const insertResult = await db.collection(DbTables.users).insertOne({
    email,
    emailVerified: payload.emailVerified ?? false,
    password: passwordHash,
    isActive: payload.isActive ?? true,
    roles: toObjectIds(payload.roles ?? []),
    createdAt: new Date(),
  });

  await db.collection(DbTables.profiles).insertOne({
    _id: insertResult.insertedId,
  });

  revalidatePath('/admin/users');

  return { success: true, message: 'User created.' };
}

export async function updateUser(payload: UserPayload) {
  if (!payload.id || !ObjectId.isValid(payload.id)) {
    return { success: false, message: 'Invalid user id.' };
  }

  const email = normalizeEmail(payload.email);

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection(DbTables.users).updateOne(
    { _id: new ObjectId(payload.id) },
    {
      $set: {
        email,
        emailVerified: payload.emailVerified ?? false,
        isActive: payload.isActive ?? true,
        roles: toObjectIds(payload.roles ?? []),
      },
    },
  );

  revalidatePath('/admin/users');

  return { success: true, message: 'User updated.' };
}

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
