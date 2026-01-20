'use server';

import { headers as _headers } from 'next/headers';
import { email, object, string, union, ZodError } from 'zod';

import clientPromise from '@app/ins/mongo-client';
import { ServerActionResponse } from '@app/models/server-action-response.server';

import { ContactFormData } from '../models/contact-form-data';

const HelpForm = object({
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
    data = HelpForm.parse(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return { status: 'error', errors: error.issues as any };
    }

    throw error;
  }

  const headers = await _headers();
  const userAgent = headers.get('user-agent');

  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() ?? realIp ?? 'unknown';

  const extendedData = {
    ip,
    userAgent,
    createdAt: new Date(),
  };

  const dbClient = await clientPromise;
  const db = dbClient.db();

  try {
    await db.collection('connections').insertOne({ ...data, ...extendedData });

    return { status: 'ok' };
  } catch (error) {
    // log the error
    console.log(error, data, extendedData);

    return { status: 'error' };
  }
}
