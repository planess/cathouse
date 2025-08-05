'use server';

import { headers as _headers } from 'next/headers';
import { email, object, string, union, ZodError } from 'zod';

import clientPromise from '@app/ins/mongo-client';

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

export default async function contactFormHandler(formData: ContactFormData) {
  let data;

  try {
    data = HelpForm.parse(formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return error.issues;
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
  } catch (error) {
    // log the error
    // console.log(error);

    return { status: 'error' };
  }
}
