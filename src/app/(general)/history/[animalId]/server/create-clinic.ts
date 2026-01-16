'use server';

import { MongoServerError } from 'mongodb';
import { z } from 'zod';

import { createClinicGranted } from '@app/accessors/create-clinic-granted';
import { DbTables } from '@app/enum/db-tables';
import { getUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';

import type { ClinicOption } from '../types';

const payloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Provide the clinic name.')
    .max(160, 'Name is too long.'),
  address: z
    .string()
    .trim()
    .min(4, 'Provide the clinic address.')
    .max(240, 'Address is too long.'),
  latitude: z
    .string()
    .trim()
    .refine((value) => value.length > 0, {
      message: 'Select clinic coordinates.',
    })
    .transform((value) => Number.parseFloat(value))
    .refine((value) => Number.isFinite(value), {
      message: 'Latitude value is invalid.',
    }),
  longitude: z
    .string()
    .trim()
    .refine((value) => value.length > 0, {
      message: 'Select clinic coordinates.',
    })
    .transform((value) => Number.parseFloat(value))
    .refine((value) => Number.isFinite(value), {
      message: 'Longitude value is invalid.',
    }),
});

type Payload = z.infer<typeof payloadSchema>;

type CreateClinicSuccess = {
  success: true;
  clinic: ClinicOption;
};

type CreateClinicError = {
  success: false;
  status: number;
  errorCode: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_INPUT' | 'SERVER_ERROR';
  message: string;
};

export type CreateClinicResponse = CreateClinicSuccess | CreateClinicError;

export async function createClinic(
  formData: FormData,
): Promise<CreateClinicResponse> {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      status: 401,
      errorCode: 'UNAUTHORIZED',
      message: 'Sign in to add clinics.',
    };
  }

  const rawPayload = {
    name: formData.get('name')?.toString() ?? '',
    address: formData.get('address')?.toString() ?? '',
    latitude: formData.get('latitude')?.toString() ?? '',
    longitude: formData.get('longitude')?.toString() ?? '',
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

  const { name, address, latitude, longitude } = parsedPayload.data;

  const client = await clientPromise;
  const db = client.db();
  const clinicsCollection = db.collection(DbTables.clinics);
  const now = new Date();

  const hasHistoryAccess = await createClinicGranted();

  if (!hasHistoryAccess) {
    return {
      success: false,
      status: 403,
      errorCode: 'FORBIDDEN',
      message: 'You do not have permission to add clinics.',
    };
  }

  try {
    const insertResult = await clinicsCollection.insertOne({
      name,
      address,
      coordinates: {
        latitude,
        longitude,
      },
      createdAt: now,
      createdBy: user.id,
    });

    return {
      success: true,
      clinic: {
        value: insertResult.insertedId.toHexString(),
        label: name,
        address,
      },
    };
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return {
        success: false,
        status: 400,
        errorCode: 'INVALID_INPUT',
        message: 'Clinic already exists.',
      };
    }

    console.error('[createClinic] Unable to save clinic', error);

    return {
      success: false,
      status: 500,
      errorCode: 'SERVER_ERROR',
      message: 'Unable to save clinic right now.',
    };
  }
}
