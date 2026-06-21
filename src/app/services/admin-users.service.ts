import { randomBytes } from 'node:crypto';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { hashBlake2 } from '@app/helpers/hash-blake2';
import clientPromise from '@app/ins/mongo-client';

import { r2Service } from './r2.service';

export type UserPayload = {
  id?: string;
  email: string;
  emailVerified: boolean;
  roles: string[];
  isActive: boolean;
  profilePhoto?: File | null;
};

export type UserOperationResult = {
  success: boolean;
  message: string;
};

type UserPayloadInput = UserPayload | FormData;

function toObjectIds(values: string[]): ObjectId[] {
  return values
    .map((value) => value.trim())
    .filter((value) => ObjectId.isValid(value))
    .map((value) => new ObjectId(value));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseBoolean(value: FormDataEntryValue | null, fallback: boolean) {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value === 'true';
}

function parseUserPayload(payload: UserPayloadInput): UserPayload {
  if (!(payload instanceof FormData)) {
    return payload;
  }

  const profilePhoto = payload.get('profilePhoto');

  return {
    id: payload.get('id')?.toString(),
    email: payload.get('email')?.toString() ?? '',
    emailVerified: parseBoolean(payload.get('emailVerified'), false),
    isActive: parseBoolean(payload.get('isActive'), true),
    roles: payload.getAll('roles').map((role) => role.toString()),
    profilePhoto:
      profilePhoto instanceof File && profilePhoto.size > 0
        ? profilePhoto
        : null,
  };
}

function getSafeFileExtension(fileName: string): string {
  const parts = fileName.trim().toLowerCase().split('.');

  if (parts.length < 2) {
    return '';
  }

  const extension = parts.at(-1) ?? '';

  return extension.replaceAll(/[^\da-z]+/g, '');
}

async function uploadProfilePhoto(userId: ObjectId, file?: File | null) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const extension = getSafeFileExtension(file.name);
  const generatedHashName = randomBytes(24).toString('hex');
  const fileName = extension
    ? `${generatedHashName}.${extension}`
    : generatedHashName;
  const [uploadedPhoto] = await r2Service.uploadFiles([file], {
    folder: `profiles/${userId.toString()}`,
    fileName,
    metadata: {
      profileId: userId.toString(),
    },
  });

  return uploadedPhoto?.key ?? null;
}

export async function createUser(input: UserPayloadInput) {
  const payload = parseUserPayload(input);
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

  const profilePhoto = await uploadProfilePhoto(
    insertResult.insertedId,
    payload.profilePhoto,
  );

  await db.collection(DbTables.profiles).insertOne({
    _id: insertResult.insertedId,
    ...(profilePhoto ? { profilePhoto } : {}),
  });

  revalidatePath('/admin/users');

  return { success: true, message: 'User created.' };
}

export async function updateUser(input: UserPayloadInput) {
  const payload = parseUserPayload(input);

  if (!payload.id || !ObjectId.isValid(payload.id)) {
    return { success: false, message: 'Invalid user id.' };
  }

  const email = normalizeEmail(payload.email);

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const userId = new ObjectId(payload.id);
  const profilePhoto = await uploadProfilePhoto(userId, payload.profilePhoto);

  await db.collection(DbTables.users).updateOne(
    { _id: userId },
    {
      $set: {
        email,
        emailVerified: payload.emailVerified ?? false,
        isActive: payload.isActive ?? true,
        roles: toObjectIds(payload.roles ?? []),
      },
    },
  );

  if (profilePhoto) {
    await db.collection(DbTables.profiles).updateOne(
      { _id: userId },
      {
        $set: {
          profilePhoto,
        },
      },
      { upsert: true },
    );
  }

  revalidatePath('/admin/users');

  return { success: true, message: 'User updated.' };
}
