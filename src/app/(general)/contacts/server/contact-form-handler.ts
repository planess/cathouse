'use server';

import { headers as _headers } from 'next/headers';
import { email, object, string, union, ZodError } from 'zod';

import clientPromise from '@app/ins/mongo-client';
import { ServerActionResponse } from '@app/models/server-action-response.server';

import { ContactFormData } from '../models/contact-form-data';

const CommunicationForm = object({
  name: string().trim(),
  contacts: union([
    /* email */ email().lowercase(),
    /* phone number */ string().regex(/[\d\s()+-]+/),
  ]),
  location: string(),
  message: string(),
}).required();

export async function handler(
  formData: ContactFormData,
): Promise<ServerActionResponse> {
  let data;

  try {
    data = CommunicationForm.parse(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return { status: 'error', errors: error.issues };
    }

    throw error;
  }

  const headers = await _headers();
  const userAgent = headers.get('user-agent');

  const extendedData = {
    userAgent,
    createdAt: Date.now(),
  };

  const dbClient = await clientPromise;
  const db = dbClient.db();

  try {
    await db
      .collection('communications')
      .insertOne({ ...data, ...extendedData });

    return { status: 'ok' };
  } catch {
    // Log the error

    return { status: 'error' };
  }
}
