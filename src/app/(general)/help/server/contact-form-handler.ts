'use server';

import { headers as _headers } from 'next/headers';
import { email, object, string, union, ZodError } from 'zod';

import clientPromise from '@app/ins/mongo-client';

import { ContactFormData } from '../models/contact-form-data';

interface StatusOK {
  status: 'ok';
}

interface StatusError {
  status: 'error';
  errors?: unknown;
}

type Response = StatusOK | StatusError;

const HelpForm = object({
  name: string().trim(),
  contacts: union([
    /* email */ email().lowercase(),
    /* phone number */ string().regex(/[\d\s()+-]+/),
  ]),
  location: string(),
  message: string(),
}).required();

export default async function contactFormHandler(
  formData: ContactFormData,
): Promise<Response> {
  let data;

  try {
    data = HelpForm.parse(formData);
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
    await db.collection('connections').insertOne({ ...data, ...extendedData });

    return { status: 'ok' };
  } catch {
    // log the error
    // console.log(error);

    return { status: 'error' };
  }
}
