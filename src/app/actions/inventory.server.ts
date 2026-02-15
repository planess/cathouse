'use server';

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
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

function normalizeText(value?: string): string {
  return value?.trim() ?? '';
}

function toObjectId(value?: string | null): ObjectId | null {
  if (!value) {
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
  if (!payload.id || !ObjectId.isValid(payload.id)) {
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

  const inUse = await db.collection(DbTables.reportsInventory).findOne({
    storage: storageObjectId,
  });

  if (inUse) {
    return {
      success: false,
      message:
        'This storage has linked inventory records and cannot be deleted.',
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
  if (!payload.id || !ObjectId.isValid(payload.id)) {
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

  if (!payload.id || !ObjectId.isValid(payload.id)) {
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
