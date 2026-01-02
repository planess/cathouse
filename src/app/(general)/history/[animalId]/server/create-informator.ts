'use server';

import { MongoServerError, type ObjectId } from 'mongodb';
import { z } from 'zod';

import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

type PersonDocument = {
  _id?: ObjectId;
  name: string;
  phone: string;
  age?: number;
  createdAt: Date;
  createdBy: ObjectId;
};

const payloadSchema = z.object({
  name: z
    .string({ required_error: 'Provide the informator name.' })
    .trim()
    .min(2, 'Provide the informator name.')
    .max(120, 'Name is too long.'),
  phone: z
    .string({ required_error: 'Provide the phone number.' })
    .trim()
    .min(6, 'Provide a valid phone number.')
    .max(32, 'Phone number is too long.'),
  age: z
    .string()
    .optional()
    .transform((value) => value?.trim()),
});

type Payload = z.infer<typeof payloadSchema>;

export type SerializedInformator = {
  id: string;
  name: string;
  phone: string;
  age?: number;
};

type CreateInformatorSuccess = {
  success: true;
  person: SerializedInformator;
};

type CreateInformatorError = {
  success: false;
  status: number;
  errorCode:
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'INVALID_INPUT'
    | 'CONFLICT'
    | 'SERVER_ERROR';
  message: string;
};

export type CreateInformatorResponse =
  | CreateInformatorSuccess
  | CreateInformatorError;

export async function createInformator(
  formData: FormData,
): Promise<CreateInformatorResponse> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      status: 401,
      errorCode: 'UNAUTHORIZED',
      message: 'Sign in to add informators.',
    };
  }

  const hasHistoryAccess = await hasPermission(
    SYSTEM_PERMISSIONS.HISTORY_CREATE,
  );

  if (!hasHistoryAccess) {
    return {
      success: false,
      status: 403,
      errorCode: 'FORBIDDEN',
      message: 'You do not have permission to add informators.',
    };
  }

  const rawPayload: Payload = {
    name: formData.get('name')?.toString() ?? '',
    phone: formData.get('phone')?.toString() ?? '',
    age: formData.get('age')?.toString(),
  };

  const parsedPayload = payloadSchema.safeParse(rawPayload);

  if (!parsedPayload.success) {
    return {
      success: false,
      status: 400,
      errorCode: 'INVALID_INPUT',
      message: parsedPayload.error.issues[0]?.message ?? 'Invalid payload.',
    };
  }

  const { name, phone, age } = parsedPayload.data;

  let numericAge: number | undefined;

  if (age) {
    const parsedAge = Number.parseInt(age, 10);

    if (Number.isNaN(parsedAge)) {
      return {
        success: false,
        status: 400,
        errorCode: 'INVALID_INPUT',
        message: 'Age must be a number.',
      };
    }

    if (parsedAge < 0 || parsedAge > 120) {
      return {
        success: false,
        status: 400,
        errorCode: 'INVALID_INPUT',
        message: 'Age must be between 0 and 120.',
      };
    }

    numericAge = parsedAge;
  }

  const client = await clientPromise;
  const db = client.db();
  const peopleCollection = db.collection<PersonDocument>(DbTables.people);
  const now = new Date();

  try {
    const insertResult = await peopleCollection.insertOne({
      name,
      phone,
      ...(typeof numericAge === 'number' ? { age: numericAge } : {}),
      createdAt: now,
      createdBy: user.id,
    });

    return {
      success: true,
      person: {
        id: insertResult.insertedId.toHexString(),
        name,
        phone,
        age: numericAge,
      },
    };
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return {
        success: false,
        status: 409,
        errorCode: 'CONFLICT',
        message: 'Phone number already exists.',
      };
    }

    console.error('[createInformator] Unable to save person', error);

    return {
      success: false,
      status: 500,
      errorCode: 'SERVER_ERROR',
      message: 'Unable to save informator right now.',
    };
  }
}
