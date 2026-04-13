'use server';

import { Decimal128, ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import { getCurrentUser } from '@app/hooks/get-user';
import clientPromise from '@app/ins/mongo-client';
import type { MediaAsset } from '@app/models/media-asset';
import { r2Service } from '@app/services/r2.service';

type StoragePayload = {
  id?: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

type CategoryPayload = {
  id?: string;
  name: string;
  inheritsId?: string | null;
};

type InventoryItemType = 'equipment' | 'consumable';

type InventoryAcceptanceItemType = 'consumable' | 'asset';

type InventoryAcceptanceTransactionType = 'donation' | 'purchase' | 'transfer';

type InventoryAcceptanceFromType =
  | 'people'
  | 'clinic'
  | 'shop'
  | 'organization'
  | 'volunteer';

type InventoryAcceptanceCondition = 'new' | 'good' | 'fair' | 'poor' | 'broken';

type InventoryTransferItemKind = 'consumable' | 'asset';

type InventoryTransferTransactionType = 'transfer' | 'release' | 'disposal';

type InventoryTransferPartyType =
  | 'people'
  | 'clinic'
  | 'volunteer'
  | 'storage';

type InventoryTransferCondition = 'good' | 'fair' | 'poor' | 'broken';

type InventoryReportPayload = {
  id?: string;
  sku: string;
  name: string;
  type: InventoryItemType;
  quantity: number;
  expirationDate: Date | null;
  categoryId: string;
  storageId: string;
  existingImages: string[];
  newImages: File[];
};

type InventoryAcceptancePayload = {
  itemType: InventoryAcceptanceItemType;
  name: string;
  categoryId: string;
  batchNumber: string;
  expiryDate: Date | null;
  unit: string;
  serialNumber: string;
  individualId: string;
  transactionType: InventoryAcceptanceTransactionType;
  fromType: InventoryAcceptanceFromType;
  fromId: string;
  fromName: string;
  toStorageId: string;
  quantity: number;
  remainingQuantity: number;
  transactionDate: Date;
  condition: InventoryAcceptanceCondition;
  damageDescription: string;
  notes: string;
  estimatedCost: Decimal128;
  mediaFiles: File[];
};

type InventoryTransferPayload = {
  entityId: string;
  itemKind: InventoryTransferItemKind;
  transactionType: InventoryTransferTransactionType;
  fromType: InventoryTransferPartyType;
  fromId: string;
  fromName: string;
  toType?: InventoryTransferPartyType;
  toId?: string;
  quantity: number;
  previousRemainingQuantity: number;
  transactionDate: Date;
  condition: InventoryTransferCondition;
  damageDescription: string;
  notes: string;
  estimatedCost: Decimal128;
  mediaFiles: File[];
};

function normalizeText(value?: string): string {
  return value?.trim() ?? '';
}

function toObjectId(value?: string | null): ObjectId | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

function isValidCoordinate(value: number | null, min: number, max: number) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

function normalizeReportType(
  value: FormDataEntryValue | null,
): InventoryItemType | null {
  if (value !== 'equipment' && value !== 'consumable') {
    return null;
  }

  return value;
}

function parseInventoryReportPayload(formData: FormData): {
  payload?: InventoryReportPayload;
  error?: string;
} {
  const idValue = formData.get('id');
  const id = typeof idValue === 'string' ? idValue : undefined;
  const skuValue = formData.get('sku');
  const nameValue = formData.get('name');
  const typeValue = formData.get('type');
  const quantityValue = formData.get('quantity');
  const expirationDateValue = formData.get('expirationDate');
  const categoryValue = formData.get('categoryId');
  const storageValue = formData.get('storageId');

  const sku = typeof skuValue === 'string' ? normalizeText(skuValue) : '';
  const name = typeof nameValue === 'string' ? normalizeText(nameValue) : '';
  const type = normalizeReportType(typeValue);
  const quantity = Number(quantityValue);
  const categoryId =
    typeof categoryValue === 'string' ? normalizeText(categoryValue) : '';
  const storageId =
    typeof storageValue === 'string' ? normalizeText(storageValue) : '';

  if (!name) {
    return { error: 'Item name is required.' };
  }

  if (!type) {
    return { error: 'Item type is required.' };
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { error: 'Quantity must be a positive integer.' };
  }

  if (!ObjectId.isValid(categoryId)) {
    return { error: 'Category is required.' };
  }

  if (!ObjectId.isValid(storageId)) {
    return { error: 'Storage is required.' };
  }

  let expirationDate: Date | null = null;
  if (typeof expirationDateValue === 'string' && expirationDateValue.trim()) {
    const parsedDate = new Date(expirationDateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return { error: 'Expiration date is invalid.' };
    }

    expirationDate = parsedDate;
  }

  const existingImages = formData
    .getAll('existingImages')
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);

  const newImages = formData
    .getAll('images')
    .filter((value): value is File => value instanceof File && value.size > 0);

  return {
    payload: {
      id,
      sku,
      name,
      type,
      quantity,
      expirationDate,
      categoryId,
      storageId,
      existingImages,
      newImages,
    },
  };
}

function normalizeAcceptanceItemType(
  value: FormDataEntryValue | null,
): InventoryAcceptanceItemType | null {
  if (value !== 'consumable' && value !== 'asset') {
    return null;
  }

  return value;
}

function normalizeAcceptanceTransactionType(
  value: FormDataEntryValue | null,
): InventoryAcceptanceTransactionType | null {
  if (value !== 'donation' && value !== 'purchase' && value !== 'transfer') {
    return null;
  }

  return value;
}

function normalizeAcceptanceFromType(
  value: FormDataEntryValue | null,
): InventoryAcceptanceFromType | null {
  if (
    value !== 'people' &&
    value !== 'clinic' &&
    value !== 'shop' &&
    value !== 'organization' &&
    value !== 'volunteer'
  ) {
    return null;
  }

  return value;
}

function normalizeAcceptanceCondition(
  value: FormDataEntryValue | null,
): InventoryAcceptanceCondition | null {
  if (
    value !== 'new' &&
    value !== 'good' &&
    value !== 'fair' &&
    value !== 'poor' &&
    value !== 'broken'
  ) {
    return null;
  }

  return value;
}

function normalizeTransferItemKind(
  value: FormDataEntryValue | null,
): InventoryTransferItemKind | null {
  if (value !== 'consumable' && value !== 'asset') {
    return null;
  }

  return value;
}

function normalizeTransferTransactionType(
  value: FormDataEntryValue | null,
): InventoryTransferTransactionType | null {
  if (value !== 'transfer' && value !== 'release' && value !== 'disposal') {
    return null;
  }

  return value;
}

function normalizeTransferPartyType(
  value: FormDataEntryValue | null,
): InventoryTransferPartyType | null {
  if (
    value !== 'people' &&
    value !== 'clinic' &&
    value !== 'volunteer' &&
    value !== 'storage'
  ) {
    return null;
  }

  return value;
}

function normalizeTransferCondition(
  value: FormDataEntryValue | null,
): InventoryTransferCondition | null {
  if (value !== 'good' && value !== 'fair' && value !== 'poor' && value !== 'broken') {
    return null;
  }

  return value;
}

function parseInventoryAcceptancePayload(formData: FormData): {
  payload?: InventoryAcceptancePayload;
  error?: string;
} {
  const itemType = normalizeAcceptanceItemType(formData.get('itemType'));
  const transactionType = normalizeAcceptanceTransactionType(
    formData.get('transactionType'),
  );
  const fromType = normalizeAcceptanceFromType(formData.get('fromType'));
  const condition = normalizeAcceptanceCondition(formData.get('condition'));

  const name = normalizeText(String(formData.get('name') ?? ''));
  const categoryId = normalizeText(String(formData.get('categoryId') ?? ''));
  const batchNumber = normalizeText(String(formData.get('batchNumber') ?? ''));
  const expiryDateRaw = normalizeText(String(formData.get('expiryDate') ?? ''));
  const unitRaw = normalizeText(String(formData.get('unit') ?? ''));
  const serialNumber = normalizeText(
    String(formData.get('serialNumber') ?? ''),
  );
  const individualId = normalizeText(
    String(formData.get('individualId') ?? ''),
  );
  const fromId = normalizeText(String(formData.get('fromId') ?? ''));
  const fromName = normalizeText(String(formData.get('fromName') ?? ''));
  const toStorageId = normalizeText(String(formData.get('toStorageId') ?? ''));
  const quantityRaw = normalizeText(String(formData.get('quantity') ?? ''));
  const remainingQuantityRaw = normalizeText(
    String(formData.get('remainingQuantity') ?? ''),
  );
  const transactionDateRaw = normalizeText(
    String(formData.get('transactionDate') ?? ''),
  );
  const damageDescription = normalizeText(
    String(formData.get('damageDescription') ?? ''),
  );
  const notes = normalizeText(String(formData.get('notes') ?? ''));
  const estimatedCostRaw = normalizeText(
    String(formData.get('estimatedCost') ?? ''),
  );

  if (!itemType) {
    return { error: 'Item type is required.' };
  }

  if (!name) {
    return { error: 'Item name is required.' };
  }

  if (!ObjectId.isValid(categoryId)) {
    return { error: 'Category is required.' };
  }

  if (!transactionType) {
    return { error: 'Transaction type is required.' };
  }

  if (!fromType) {
    return { error: 'Source type is required.' };
  }

  if (!ObjectId.isValid(toStorageId)) {
    return { error: 'Storage is required.' };
  }

  if (!condition) {
    return { error: 'Condition is required.' };
  }

  if (!transactionDateRaw) {
    return { error: 'Transaction date is required.' };
  }

  const transactionDate = new Date(transactionDateRaw);

  if (Number.isNaN(transactionDate.getTime())) {
    return { error: 'Transaction date is invalid.' };
  }

  const estimatedCostNumber = Number(estimatedCostRaw);

  if (!Number.isFinite(estimatedCostNumber) || estimatedCostNumber < 0) {
    return { error: 'Estimated cost must be zero or more.' };
  }

  let expiryDate: Date | null = null;
  if (expiryDateRaw.length > 0) {
    const parsedExpiryDate = new Date(expiryDateRaw);

    if (Number.isNaN(parsedExpiryDate.getTime())) {
      return { error: 'Expiry date is invalid.' };
    }

    expiryDate = parsedExpiryDate;
  }

  const isFromIdType =
    fromType === 'people' || fromType === 'clinic' || fromType === 'volunteer';

  if (isFromIdType && !ObjectId.isValid(fromId)) {
    return { error: 'Valid source is required.' };
  }

  if ((fromType === 'shop' || fromType === 'organization') && !fromName) {
    return { error: 'Source name is required.' };
  }

  let quantity = 1;
  let remainingQuantity = 1;

  if (itemType === 'consumable') {
    if (!batchNumber) {
      return { error: 'Batch number is required for consumables.' };
    }

    if (!unitRaw) {
      return { error: 'Unit is required for consumables.' };
    }

    quantity = Number(quantityRaw);
    remainingQuantity = Number(remainingQuantityRaw);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { error: 'Quantity must be a positive integer.' };
    }

    if (!Number.isInteger(remainingQuantity) || remainingQuantity <= 0) {
      return { error: 'Remaining quantity must be a positive integer.' };
    }
  }

  if (itemType === 'asset') {
    if (!serialNumber) {
      return { error: 'Serial number is required for assets.' };
    }

    if (!individualId) {
      return { error: 'Individual ID is required for assets.' };
    }
  }

  const mediaFiles = formData
    .getAll('media')
    .filter((value): value is File => value instanceof File && value.size > 0)
    .filter((file) => !file.type.startsWith('video/'));

  return {
    payload: {
      itemType,
      name,
      categoryId,
      batchNumber,
      expiryDate,
      unit: unitRaw,
      serialNumber,
      individualId,
      transactionType,
      fromType,
      fromId,
      fromName,
      toStorageId,
      quantity,
      remainingQuantity,
      transactionDate,
      condition,
      damageDescription,
      notes,
      estimatedCost: Decimal128.fromString(estimatedCostNumber.toFixed(2)),
      mediaFiles,
    },
  };
}

function parseInventoryTransferPayload(formData: FormData): {
  payload?: InventoryTransferPayload;
  error?: string;
} {
  const entityId = normalizeText(String(formData.get('entityId') ?? ''));
  const itemKind = normalizeTransferItemKind(formData.get('itemKind'));
  const transactionType = normalizeTransferTransactionType(
    formData.get('transactionType'),
  );
  const fromType = normalizeTransferPartyType(formData.get('fromType'));
  const toType = normalizeTransferPartyType(formData.get('toType'));
  const condition = normalizeTransferCondition(formData.get('condition'));

  const fromId = normalizeText(String(formData.get('fromId') ?? ''));
  const fromName = normalizeText(String(formData.get('fromName') ?? ''));
  const toId = normalizeText(String(formData.get('toId') ?? ''));
  const quantityRaw = normalizeText(String(formData.get('quantity') ?? ''));
  const previousRemainingQuantityRaw = normalizeText(
    String(formData.get('previousRemainingQuantity') ?? ''),
  );
  const transactionDateRaw = normalizeText(
    String(formData.get('transactionDate') ?? ''),
  );
  const damageDescription = normalizeText(
    String(formData.get('damageDescription') ?? ''),
  );
  const notes = normalizeText(String(formData.get('notes') ?? ''));
  const estimatedCostRaw = normalizeText(
    String(formData.get('estimatedCost') ?? ''),
  );

  if (!ObjectId.isValid(entityId)) {
    return { error: 'Entity is required.' };
  }

  if (!itemKind) {
    return { error: 'Entity type is required.' };
  }

  if (!transactionType) {
    return { error: 'Transaction type is required.' };
  }

  if (!fromType) {
    return { error: 'Source type is required.' };
  }

  if (transactionType !== 'disposal') {
    if (!toType) {
      return { error: 'Destination type is required.' };
    }

    if (!ObjectId.isValid(toId)) {
      return { error: 'Destination is required.' };
    }
  }

  if (!condition) {
    return { error: 'Condition is required.' };
  }

  const quantity = Number(quantityRaw);
  const previousRemainingQuantity = Number(previousRemainingQuantityRaw);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: 'Quantity must be greater than zero.' };
  }

  if (
    !Number.isFinite(previousRemainingQuantity) ||
    previousRemainingQuantity <= 0
  ) {
    return { error: 'Previous remaining quantity is invalid.' };
  }

  if (quantity < previousRemainingQuantity) {
    return {
      error: 'Quantity must be at least the previous remaining quantity.',
    };
  }

  if (!transactionDateRaw) {
    return { error: 'Transaction date is required.' };
  }

  const transactionDate = new Date(transactionDateRaw);

  if (Number.isNaN(transactionDate.getTime())) {
    return { error: 'Transaction date is invalid.' };
  }

  if (fromId.length > 0 && !ObjectId.isValid(fromId)) {
    return { error: 'Source is invalid.' };
  }

  if (fromId.length === 0 && fromName.length === 0) {
    return { error: 'Source is required.' };
  }

  const estimatedCostNumber = Number(estimatedCostRaw);

  if (!Number.isFinite(estimatedCostNumber) || estimatedCostNumber < 0) {
    return { error: 'Estimated cost must be zero or more.' };
  }

  const mediaFiles = formData
    .getAll('media')
    .filter((value): value is File => value instanceof File && value.size > 0)
    .filter((file) => !file.type.startsWith('video/'));

  return {
    payload: {
      entityId,
      itemKind,
      transactionType,
      fromType,
      fromId,
      fromName,
      ...(transactionType !== 'disposal' && toType ? { toType } : {}),
      ...(transactionType !== 'disposal' ? { toId } : {}),
      quantity,
      previousRemainingQuantity,
      transactionDate,
      condition,
      damageDescription,
      notes,
      estimatedCost: Decimal128.fromString(estimatedCostNumber.toFixed(2)),
      mediaFiles,
    },
  };
}

function normalizeMediaAssets(assets: MediaAsset[]) {
  return assets.map((asset) => ({
    key: asset.key,
    url: asset.url,
    size: asset.size,
    mimeType: asset.mimeType,
    originalName: asset.originalName,
    uploadedAt:
      asset.uploadedAt instanceof Date ? asset.uploadedAt : new Date(),
    checksum: asset.checksum ?? '',
  }));
}

export async function createStorage(payload: StoragePayload) {
  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Storage name is required.' };
  }

  if (!isValidCoordinate(payload.latitude, -90, 90)) {
    return { success: false, message: 'Latitude is required.' };
  }

  if (!isValidCoordinate(payload.longitude, -180, 180)) {
    return { success: false, message: 'Longitude is required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const insertResult = await db
    .collection(DbTables.inventoryStorage)
    .insertOne({
      name,
      location: {
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      createdAt: new Date(),
    });

  revalidatePath('/admin/inventory');

  return {
    success: true,
    message: 'Storage created.',
    storageId: insertResult.insertedId.toString(),
  };
}

export async function updateStorage(payload: StoragePayload) {
  if (
    typeof payload.id !== 'string' ||
    payload.id.length === 0 ||
    !ObjectId.isValid(payload.id)
  ) {
    return { success: false, message: 'Invalid storage id.' };
  }

  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Storage name is required.' };
  }

  if (!isValidCoordinate(payload.latitude, -90, 90)) {
    return { success: false, message: 'Latitude is required.' };
  }

  if (!isValidCoordinate(payload.longitude, -180, 180)) {
    return { success: false, message: 'Longitude is required.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection(DbTables.inventoryStorage).updateOne(
    { _id: new ObjectId(payload.id) },
    {
      $set: {
        name,
        location: {
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
      },
    },
  );

  revalidatePath('/admin/inventory');

  return { success: true, message: 'Storage updated.' };
}

export async function deleteStorage(storageId: string) {
  if (!ObjectId.isValid(storageId)) {
    return { success: false, message: 'Invalid storage id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const storageObjectId = new ObjectId(storageId);

  const inUse = await db.collection(DbTables.inventoryTransactions).findOne({
    $or: [{ from: storageObjectId }, { to: storageObjectId }],
  });

  if (inUse) {
    return {
      success: false,
      message:
        'This storage has linked inventory transactions and cannot be deleted.',
    };
  }

  await db.collection(DbTables.inventoryStorage).deleteOne({
    _id: storageObjectId,
  });

  revalidatePath('/admin/inventory');

  return { success: true, message: 'Storage deleted.' };
}

export async function createCategory(payload: CategoryPayload) {
  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }

  const inheritsId = toObjectId(payload.inheritsId);

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db.collection(DbTables.inventoryCategories).insertOne({
    name,
    ...(inheritsId ? { inherits: inheritsId } : {}),
    createdAt: new Date(),
  });

  revalidatePath('/admin/inventory');

  return { success: true, message: 'Category created.' };
}

export async function updateCategory(payload: CategoryPayload) {
  if (
    typeof payload.id !== 'string' ||
    payload.id.length === 0 ||
    !ObjectId.isValid(payload.id)
  ) {
    return { success: false, message: 'Invalid category id.' };
  }

  const name = normalizeText(payload.name);

  if (!name) {
    return { success: false, message: 'Category name is required.' };
  }

  const inheritsId = toObjectId(payload.inheritsId);

  if (inheritsId?.toString() === payload.id) {
    return { success: false, message: 'Category cannot inherit from itself.' };
  }

  const update: { $set: Record<string, unknown>; $unset?: Record<string, ''> } =
    {
      $set: {
        name,
      },
    };

  if (inheritsId) {
    update.$set.inherits = inheritsId;
  } else {
    update.$unset = { inherits: '' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  await db
    .collection(DbTables.inventoryCategories)
    .updateOne({ _id: new ObjectId(payload.id) }, update);

  revalidatePath('/admin/inventory');

  return { success: true, message: 'Category updated.' };
}

export async function deleteCategory(categoryId: string) {
  if (!ObjectId.isValid(categoryId)) {
    return { success: false, message: 'Invalid category id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const categoryObjectId = new ObjectId(categoryId);
  const category = await db.collection(DbTables.inventoryCategories).findOne({
    _id: categoryObjectId,
  });

  if (!category) {
    return { success: false, message: 'Category not found.' };
  }

  const child = await db.collection(DbTables.inventoryCategories).findOne({
    inherits: categoryObjectId,
  });

  if (child) {
    return {
      success: false,
      message: 'This category has nested categories and cannot be deleted.',
    };
  }

  const inUse = await db.collection(DbTables.reportsInventory).findOne({
    category: categoryObjectId,
  });

  if (inUse) {
    return {
      success: false,
      message:
        'This category has linked inventory records and cannot be deleted.',
    };
  }

  await db.collection(DbTables.inventoryCategories).deleteOne({
    _id: categoryObjectId,
  });

  revalidatePath('/admin/inventory');

  return { success: true, message: 'Category deleted.' };
}

export async function createInventoryAcceptance(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return { success: false, message: 'You must be signed in.' };
  }

  const { payload, error } = parseInventoryAcceptancePayload(formData);

  if (!payload) {
    return { success: false, message: error ?? 'Invalid payload.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const categoryObjectId = new ObjectId(payload.categoryId);
  const storageObjectId = new ObjectId(payload.toStorageId);

  const [category, storage] = await Promise.all([
    db.collection(DbTables.inventoryCategories).findOne({
      _id: categoryObjectId,
    }),
    db.collection(DbTables.inventoryStorage).findOne({
      _id: storageObjectId,
    }),
  ]);

  if (!category) {
    return { success: false, message: 'Category not found.' };
  }

  if (!storage) {
    return { success: false, message: 'Storage not found.' };
  }

  const sourceId = toObjectId(payload.fromId);
  let sourceName = payload.fromName;

  if (payload.fromType === 'people') {
    if (!sourceId) {
      return { success: false, message: 'Person source is required.' };
    }

    const person = await db
      .collection<{ _id: ObjectId; name?: string }>(DbTables.people)
      .findOne({ _id: sourceId }, { projection: { name: 1 } });

    if (!person) {
      return { success: false, message: 'Person source not found.' };
    }

    sourceName = normalizeText(person.name);
  }

  if (payload.fromType === 'clinic') {
    if (!sourceId) {
      return { success: false, message: 'Clinic source is required.' };
    }

    const clinic = await db
      .collection<{ _id: ObjectId; name?: string }>(DbTables.clinics)
      .findOne({ _id: sourceId }, { projection: { name: 1 } });

    if (!clinic) {
      return { success: false, message: 'Clinic source not found.' };
    }

    sourceName = normalizeText(clinic.name);
  }

  if (payload.fromType === 'volunteer') {
    if (!sourceId) {
      return { success: false, message: 'Volunteer source is required.' };
    }

    const volunteer = await db
      .collection<{ _id: ObjectId; email?: string }>(DbTables.users)
      .findOne({ _id: sourceId }, { projection: { email: 1 } });

    if (!volunteer) {
      return { success: false, message: 'Volunteer source not found.' };
    }

    sourceName = normalizeText(volunteer.email);
  }

  const now = new Date();
  const itemId = new ObjectId();
  const entityId = new ObjectId();
  const provisionalTransactionId = new ObjectId();

  const uploadedMedia = await r2Service.uploadFiles(payload.mediaFiles, {
    folder: 'inventory/transactions',
    fileNameBase: 'inventory-acceptance',
    metadata: {
      section: 'inventory_transactions',
      createdBy: currentUser.id.toHexString(),
    },
  });

  await db.collection(DbTables.inventoryItems).insertOne({
    _id: itemId,
    name: payload.name,
    type: payload.itemType,
    category: categoryObjectId,
    createdAt: now,
    createdBy: currentUser.id,
  });

  await db.collection(
    payload.itemType === 'consumable'
      ? DbTables.inventoryConsumables
      : DbTables.inventoryAssets,
  ).insertOne(
    payload.itemType === 'consumable'
      ? {
        _id: entityId,
        itemId,
        batchNumber: payload.batchNumber,
        ...(payload.expiryDate ? { expiryDate: payload.expiryDate } : {}),
        unit: payload.unit,
        firstTransactionId: provisionalTransactionId,
        lastTransactionId: provisionalTransactionId,
      }
      : {
        _id: entityId,
        itemId,
        serialNumber: payload.serialNumber,
        individualId: payload.individualId,
        firstTransactionId: provisionalTransactionId,
        lastTransactionId: provisionalTransactionId,
      },
  );

  const transactionInsertResult = await db
    .collection(DbTables.inventoryTransactions)
    .insertOne({
      entityId,
      type: payload.transactionType,
      from: {
        type: payload.fromType,
        ...(sourceId ? { id: sourceId } : {}),
        ...(sourceName ? { name: sourceName } : {}),
      },
      to: {
        type: 'storage',
        id: storageObjectId,
        ...(typeof storage.name === 'string' && storage.name.trim()
          ? { name: storage.name.trim() }
          : {}),
      },
      quantity: payload.itemType === 'consumable' ? payload.quantity : 1,
      remainingQuantity:
        payload.itemType === 'consumable' ? payload.remainingQuantity : 1,
      date: payload.transactionDate,
      condition: payload.condition,
      ...(payload.damageDescription
        ? { damageDescription: payload.damageDescription }
        : {}),
      ...(payload.notes ? { notes: payload.notes } : {}),
      estimatedCost: payload.estimatedCost,
      ...(uploadedMedia.length > 0
        ? { media: normalizeMediaAssets(uploadedMedia) }
        : {}),
      createdAt: now,
      createdBy: currentUser.id,
    });

  const persistedTransactionId = transactionInsertResult.insertedId;

  await db.collection(
    payload.itemType === 'consumable'
      ? DbTables.inventoryConsumables
      : DbTables.inventoryAssets,
  ).updateOne(
    { _id: entityId },
    {
      $set: {
        firstTransactionId: persistedTransactionId,
        lastTransactionId: persistedTransactionId,
      },
    },
  );

  revalidatePath('/admin/inventory');

  return { success: true, message: 'Inventory acceptance created.' };
}

export async function appendInventoryTransaction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) {
    return { success: false, message: 'You must be signed in.' };
  }

  const { payload, error } = parseInventoryTransferPayload(formData);

  if (!payload) {
    return { success: false, message: error ?? 'Invalid payload.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const entityObjectId = new ObjectId(payload.entityId);
  const entityCollection =
    payload.itemKind === 'consumable'
      ? DbTables.inventoryConsumables
      : DbTables.inventoryAssets;

  const entity = await db.collection(entityCollection).findOne({
    _id: entityObjectId,
  });

  if (!entity) {
    return { success: false, message: 'Inventory entity not found.' };
  }

  let destinationId: ObjectId | null = null;
  let destinationName = '';

  if (payload.transactionType !== 'disposal') {
    if (
      typeof payload.toId !== 'string' ||
      !ObjectId.isValid(payload.toId) ||
      !payload.toType
    ) {
      return { success: false, message: 'Destination is required.' };
    }

    destinationId = new ObjectId(payload.toId);

    if (payload.toType === 'people') {
      const person = await db
        .collection<{ _id: ObjectId; name?: string }>(DbTables.people)
        .findOne({ _id: destinationId }, { projection: { name: 1 } });

      if (!person) {
        return { success: false, message: 'Destination person not found.' };
      }

      destinationName = normalizeText(person.name);
    }

    if (payload.toType === 'clinic') {
      const clinic = await db
        .collection<{ _id: ObjectId; name?: string }>(DbTables.clinics)
        .findOne({ _id: destinationId }, { projection: { name: 1 } });

      if (!clinic) {
        return { success: false, message: 'Destination clinic not found.' };
      }

      destinationName = normalizeText(clinic.name);
    }

    if (payload.toType === 'volunteer') {
      const volunteer = await db
        .collection<{ _id: ObjectId; email?: string }>(DbTables.users)
        .findOne({ _id: destinationId }, { projection: { email: 1 } });

      if (!volunteer) {
        return { success: false, message: 'Destination volunteer not found.' };
      }

      destinationName = normalizeText(volunteer.email);
    }

    if (payload.toType === 'storage') {
      const storage = await db
        .collection<{ _id: ObjectId; name?: string }>(DbTables.inventoryStorage)
        .findOne({ _id: destinationId }, { projection: { name: 1 } });

      if (!storage) {
        return { success: false, message: 'Destination storage not found.' };
      }

      destinationName = normalizeText(storage.name);
    }
  }

  const fromObjectId = toObjectId(payload.fromId);
  const uploadedMedia = await r2Service.uploadFiles(payload.mediaFiles, {
    folder: 'inventory/transactions',
    fileNameBase: 'inventory-transfer',
    metadata: {
      section: 'inventory_transactions',
      createdBy: currentUser.id.toHexString(),
    },
  });

  const remainingQuantity =
    payload.transactionType === 'transfer'
      ? payload.previousRemainingQuantity + payload.quantity
      : payload.previousRemainingQuantity - payload.quantity;

  const now = new Date();
  const transactionResult = await db
    .collection(DbTables.inventoryTransactions)
    .insertOne({
      entityId: entityObjectId,
      type: payload.transactionType,
      from: {
        type: payload.fromType,
        ...(fromObjectId ? { id: fromObjectId } : {}),
        ...(payload.fromName ? { name: payload.fromName } : {}),
      },
      ...(payload.transactionType !== 'disposal' &&
      payload.toType &&
      destinationId
        ? {
          to: {
            type: payload.toType,
            id: destinationId,
            ...(destinationName ? { name: destinationName } : {}),
          },
        }
        : {}),
      quantity: payload.quantity,
      remainingQuantity,
      date: payload.transactionDate,
      condition: payload.condition,
      ...(payload.damageDescription
        ? { damageDescription: payload.damageDescription }
        : {}),
      ...(payload.notes ? { notes: payload.notes } : {}),
      estimatedCost: payload.estimatedCost,
      ...(uploadedMedia.length > 0
        ? { media: normalizeMediaAssets(uploadedMedia) }
        : {}),
      createdAt: now,
      createdBy: currentUser.id,
    });

  await db.collection(entityCollection).updateOne(
    { _id: entityObjectId },
    {
      $set: {
        lastTransactionId: transactionResult.insertedId,
      },
    },
  );

  revalidatePath('/admin/inventory');

  return { success: true, message: 'Inventory transaction appended.' };
}

export async function createInventoryReport(formData: FormData) {
  const { payload, error } = parseInventoryReportPayload(formData);

  if (!payload) {
    return { success: false, message: error ?? 'Invalid payload.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [category, storage] = await Promise.all([
    db.collection(DbTables.inventoryCategories).findOne({
      _id: new ObjectId(payload.categoryId),
    }),
    db.collection(DbTables.inventoryStorage).findOne({
      _id: new ObjectId(payload.storageId),
    }),
  ]);

  if (!category) {
    return { success: false, message: 'Category not found.' };
  }

  if (!storage) {
    return { success: false, message: 'Storage not found.' };
  }

  const uploadedAssets = await r2Service.uploadFiles(payload.newImages, {
    folder: 'inventory',
    metadata: {
      section: 'reports_inventory',
    },
  });

  const images = [
    ...payload.existingImages,
    ...uploadedAssets.map((asset) => asset.url),
  ];

  await db.collection(DbTables.reportsInventory).insertOne({
    ...(payload.sku ? { sku: payload.sku } : {}),
    name: payload.name,
    type: payload.type,
    quantity: payload.quantity,
    ...(payload.expirationDate
      ? { expirationDate: payload.expirationDate }
      : {}),
    category: new ObjectId(payload.categoryId),
    storage: new ObjectId(payload.storageId),
    ...(images.length > 0 ? { images } : {}),
    createdAt: new Date(),
  });

  revalidatePath('/admin/inventory');

  return { success: true, message: 'Inventory item created.' };
}

export async function updateInventoryReport(formData: FormData) {
  const { payload, error } = parseInventoryReportPayload(formData);

  if (!payload) {
    return { success: false, message: error ?? 'Invalid payload.' };
  }

  if (
    typeof payload.id !== 'string' ||
    payload.id.length === 0 ||
    !ObjectId.isValid(payload.id)
  ) {
    return { success: false, message: 'Invalid inventory item id.' };
  }

  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [report, category, storage] = await Promise.all([
    db.collection(DbTables.reportsInventory).findOne({
      _id: new ObjectId(payload.id),
    }),
    db.collection(DbTables.inventoryCategories).findOne({
      _id: new ObjectId(payload.categoryId),
    }),
    db.collection(DbTables.inventoryStorage).findOne({
      _id: new ObjectId(payload.storageId),
    }),
  ]);

  if (!report) {
    return { success: false, message: 'Inventory item not found.' };
  }

  if (!category) {
    return { success: false, message: 'Category not found.' };
  }

  if (!storage) {
    return { success: false, message: 'Storage not found.' };
  }

  const uploadedAssets = await r2Service.uploadFiles(payload.newImages, {
    folder: 'inventory',
    metadata: {
      section: 'reports_inventory',
    },
  });

  const images = [
    ...payload.existingImages,
    ...uploadedAssets.map((asset) => asset.url),
  ];

  const update: { $set: Record<string, unknown>; $unset?: Record<string, ''> } =
    {
      $set: {
        name: payload.name,
        type: payload.type,
        quantity: payload.quantity,
        category: new ObjectId(payload.categoryId),
        storage: new ObjectId(payload.storageId),
      },
    };

  if (payload.sku) {
    update.$set.sku = payload.sku;
  } else {
    update.$unset = {
      ...(update.$unset ?? {}),
      sku: '',
    };
  }

  if (payload.expirationDate) {
    update.$set.expirationDate = payload.expirationDate;
  } else {
    update.$unset = {
      ...(update.$unset ?? {}),
      expirationDate: '',
    };
  }

  if (images.length > 0) {
    update.$set.images = images;
  } else {
    update.$unset = {
      ...(update.$unset ?? {}),
      images: '',
    };
  }

  await db
    .collection(DbTables.reportsInventory)
    .updateOne({ _id: new ObjectId(payload.id) }, update);

  revalidatePath('/admin/inventory');

  return { success: true, message: 'Inventory item updated.' };
}
