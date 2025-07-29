'use server';

import clientPromise from '@app/ins/mongo-client';

import { ContactFormData } from '../models/contact-form-data';

export default async function contactFormHandler(formData: ContactFormData) {
  console.log('-form data', formData);

  return {...formData, status: 'ok'};

  const c = await clientPromise;

  const result = await c.db().collection('connections').insertOne(formData);

  console.log('-result', result);

  return { status: 'ok' };
}
