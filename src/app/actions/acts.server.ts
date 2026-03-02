'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { MediaAsset } from '@app/models/media-asset';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { requirePermission } from '@app/services/access-verification.service';
import { r2Service } from '@app/services/r2.service';

import type { InventoryItemCondition } from '../(admin)/admin/inventory/types/inventory-db.types';

type VolunteerActMutableFields = {
  types: ObjectId;
  status: 'scheduled' | 'pending' | 'approved' | 'rejected';
  sessionStart: Date;
  sessionEnd: Date;
  notes?: string;
  animalId?: ObjectId[];
  equipments?: {
    itemId: ObjectId;
    conditionBefore: InventoryItemCondition;
    conditionAfter: InventoryItemCondition;
    notes?: string;
    media?: MediaAsset[];
  }[];
};

type VolunteerActRecord = {
  _id?: ObjectId;
  volunteerId: ObjectId;
  types: ObjectId;
  status: 'scheduled' | 'pending' | 'approved' | 'rejected';
  sessionStart: Date;
  sessionEnd: Date;
  notes?: string;
  animalId?: ObjectId[];
  managedBy?: ObjectId;
  managedAt?: Date;
  equipments?: {
    itemId: ObjectId;
    conditionBefore: InventoryItemCondition;
    conditionAfter: InventoryItemCondition;
    notes?: string;
    media?: MediaAsset[];
  }[];
  documents?: MediaAsset[];
  createdAt: Date;
  createdBy: ObjectId;
};

const ALLOWED_CONDITIONS = new Set(['new', 'good', 'fair', 'poor', 'broken']);
const VOLUNTEER_EDITABLE_STATUSES = new Set([
  'scheduled',
  'pending',
  'rejected',
]);

function toObjectId(value: string | null): ObjectId | null {
  if (value === null || value.trim() === '' || !ObjectId.isValid(value)) {
    return null;
  }

  return new ObjectId(value);
}

function parseDateTime(value: string | null): Date | null {
  if (value === null || value.trim() === '') {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function computeVolunteerStatus(sessionStart: Date): 'scheduled' | 'pending' {
  return sessionStart.getTime() > Date.now() ? 'scheduled' : 'pending';
}

async function parseEquipments(formData: FormData): Promise<{
  data?: VolunteerActMutableFields['equipments'];
  error?: string;
}> {
  const rawCount = Number(String(formData.get('equipmentCount') ?? '0'));
  const count = Number.isInteger(rawCount) && rawCount > 0 ? rawCount : 0;

  if (count === 0) {
    return { data: [] };
  }

  const rows: NonNullable<VolunteerActMutableFields['equipments']> = [];

  for (let i = 0; i < count; i += 1) {
    const itemId = String(formData.get(`equipmentItemId_${i}`) ?? '').trim();
    const conditionBefore = String(
      formData.get(`equipmentConditionBefore_${i}`) ?? '',
    ).trim();
    const conditionAfter = String(
      formData.get(`equipmentConditionAfter_${i}`) ?? '',
    ).trim();
    const notes = String(formData.get(`equipmentNotes_${i}`) ?? '').trim();

    if (
      itemId === '' ||
      !ObjectId.isValid(itemId) ||
      !ALLOWED_CONDITIONS.has(conditionBefore) ||
      !ALLOWED_CONDITIONS.has(conditionAfter)
    ) {
      continue;
    }

    const files = formData
      .getAll(`equipmentMedia_${i}`)
      .filter(
        (value): value is File => value instanceof File && value.size > 0,
      );

    const uploadedMedia =
      files.length > 0
        ? await r2Service.uploadFiles(files, {
            folder: 'acts/equipment-media',
            fileNameBase: `act-equipment-${i + 1}`,
          })
        : [];

    rows.push({
      itemId: new ObjectId(itemId),
      conditionBefore: conditionBefore as InventoryItemCondition,
      conditionAfter: conditionAfter as InventoryItemCondition,
      ...(notes !== '' ? { notes } : {}),
      ...(uploadedMedia.length > 0 ? { media: uploadedMedia } : {}),
    });
  }

  return { data: rows };
}

async function parseFormToMutableFields(
  formData: FormData,
): Promise<{
  data?: VolunteerActMutableFields;
  error?: string;
  documentAssets?: MediaAsset[];
}> {
  const typeId = String(formData.get('typeId') ?? '').trim();
  const sessionStartRaw = String(formData.get('sessionStart') ?? '').trim();
  const sessionEndRaw = String(formData.get('sessionEnd') ?? '').trim();
  const notesRaw = String(formData.get('notes') ?? '').trim();

  const typeObjectId = toObjectId(typeId);
  if (!typeObjectId) {
    return { error: 'Valid type is required.' };
  }

  const sessionStart = parseDateTime(sessionStartRaw);
  const sessionEnd = parseDateTime(sessionEndRaw);

  if (!sessionStart || !sessionEnd) {
    return { error: 'Session start and end are required.' };
  }

  if (sessionStart > sessionEnd) {
    return { error: 'Session start must be before session end.' };
  }

  const animalIds = formData
    .getAll('animalIds')
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => ObjectId.isValid(value))
    .map((value) => new ObjectId(value));

  const parsedEquipments = await parseEquipments(formData);

  if (!parsedEquipments.data) {
    return { error: parsedEquipments.error ?? 'Invalid equipments.' };
  }

  const files = formData
    .getAll('documents')
    .filter((value): value is File => value instanceof File && value.size > 0);

  let documentAssets: MediaAsset[] = [];

  if (files.length > 0) {
    const uploadedAssets = await r2Service.uploadFiles(files, {
      folder: 'acts/documents',
      fileNameBase: 'act-document',
    });

    documentAssets = uploadedAssets;
  }

  return {
    data: {
      types: typeObjectId,
      status: computeVolunteerStatus(sessionStart),
      sessionStart,
      sessionEnd,
      ...(notesRaw ? { notes: notesRaw } : {}),
      ...(animalIds.length > 0 ? { animalId: animalIds } : {}),
      ...(parsedEquipments.data.length > 0
        ? { equipments: parsedEquipments.data }
        : {}),
    },
    documentAssets,
  };
}

export async function createVolunteerAct(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return;
  }

  await requirePermission(
    SYSTEM_PERMISSIONS.ACT_CREATE,
    undefined,
    currentUser.id,
  );

  const parsed = await parseFormToMutableFields(formData);

  if (!parsed.data) {
    return;
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection<VolunteerActRecord>(DbTables.volunteerActs).insertOne({
    volunteerId: currentUser.id,
    ...parsed.data,
    ...(parsed.documentAssets && parsed.documentAssets.length > 0
      ? { documents: parsed.documentAssets }
      : {}),
    createdAt: new Date(),
    createdBy: currentUser.id,
  });

  revalidatePath('/acts');
}

export async function updateVolunteerAct(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return;
  }

  await requirePermission(
    SYSTEM_PERMISSIONS.ACT_UPDATE,
    undefined,
    currentUser.id,
  );

  const actId = String(formData.get('actId') ?? '').trim();

  if (!ObjectId.isValid(actId)) {
    return;
  }

  const parsed = await parseFormToMutableFields(formData);

  if (!parsed.data) {
    return;
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();
  const actsCollection = db.collection<VolunteerActRecord>(
    DbTables.volunteerActs,
  );

  const existing = await actsCollection.findOne({
    _id: new ObjectId(actId),
    volunteerId: currentUser.id,
  });

  if (!existing) {
    return;
  }

  if (!VOLUNTEER_EDITABLE_STATUSES.has(existing.status)) {
    return;
  }

  const existingDocuments = Array.isArray(existing.documents)
    ? existing.documents
    : [];

  const nextDocuments = [
    ...existingDocuments,
    ...(parsed.documentAssets ?? []),
  ];

  await actsCollection.updateOne(
    { _id: new ObjectId(actId), volunteerId: currentUser.id },
    {
      $set: {
        ...parsed.data,
        status:
          existing.status === 'rejected'
            ? 'rejected'
            : computeVolunteerStatus(parsed.data.sessionStart),
        documents: nextDocuments,
      },
    },
  );

  revalidatePath('/acts');
}

export async function deleteVolunteerAct(formData: FormData): Promise<void> {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return;
  }

  await requirePermission(
    SYSTEM_PERMISSIONS.ACT_DELETE,
    undefined,
    currentUser.id,
  );

  const actId = String(formData.get('actId') ?? '').trim();

  if (!ObjectId.isValid(actId)) {
    return;
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const result = await db
    .collection<VolunteerActRecord>(DbTables.volunteerActs)
    .deleteOne({
      _id: new ObjectId(actId),
      volunteerId: currentUser.id,
    });

  if (result.deletedCount === 0) {
    return;
  }

  revalidatePath('/acts');
}
