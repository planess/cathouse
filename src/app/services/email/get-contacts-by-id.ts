import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import { mapContact } from './map-contact';

import type { EmailContactDocument } from './document-types';
import type { EmailAddressSummary } from './types/email-address-summary';

export async function getContactsById(contactIds: string[]) {
  const uniqueContactIds = [...new Set(contactIds)]
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  if (uniqueContactIds.length === 0) {
    return new Map<string, EmailAddressSummary>();
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const contacts = await db
    .collection<EmailContactDocument>(DbTables.emailContacts)
    .find({ _id: { $in: uniqueContactIds } })
    .toArray();

  return new Map(
    contacts.map((contact) => [contact._id.toString(), mapContact(contact)]),
  );
}
