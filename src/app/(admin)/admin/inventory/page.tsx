import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import { InventoryAdminView } from './components/inventory-admin-view';
import {
  buildCategoryTree,
  formatDateLabel,
} from './helpers/inventory-helpers';
import {
  toDateInput,
  toNumberOrNull,
  toObjectId,
  toRecord,
  toText,
  toTypedArray,
} from './helpers/inventory-page-value-helpers';
import { mapCategoryForTable } from './helpers/inventory-table-category.helpers';
import { buildTransactionParty } from './helpers/inventory-transaction-party.helpers';
import { StorageWithLocation } from './types/inventory-page.types';

import type { InventoryCategoryDocument } from './types/inventory-db.types';
import type {
  InventoryAdminViewProps,
  InventoryEntityRow,
  InventoryTransactionMediaRow,
  InventoryItemRow,
  InventoryTransactionRow,
} from './types/inventory.types';

type InventorySourceDocument = {
  _id: ObjectId;
  name?: string;
};

type InventoryVolunteerDocument = {
  _id: ObjectId;
  email?: string;
};

function toTransactionMediaRows(value: unknown): InventoryTransactionMediaRow[] {
  const media = toTypedArray<Record<string, unknown>>(value);

  return media.map((asset) => {
    const uploadedAtInput = toDateInput(asset.uploadedAt);

    const uploadedAt =
      uploadedAtInput instanceof Date
        ? uploadedAtInput.toISOString()
        : typeof uploadedAtInput === 'number'
          ? (() => {
            const date = new Date(uploadedAtInput);

            return Number.isNaN(date.getTime()) ? '' : date.toISOString();
          })()
          : typeof uploadedAtInput === 'string'
            ? uploadedAtInput
            : '';

    const size = toNumberOrNull(asset.size);
    const mimeType = toText(asset.mimeType);
    const originalName = toText(asset.originalName);

    return {
      key: toText(asset.key),
      url: toText(asset.url),
      ...(size !== null ? { size } : {}),
      ...(mimeType.length > 0 ? { mimeType } : {}),
      ...(originalName.length > 0 ? { originalName } : {}),
      uploadedAt,
      ...(typeof asset.isDeleted === 'boolean'
        ? { isDeleted: asset.isDeleted }
        : {}),
      checksum: toText(asset.checksum),
    };
  });
}

export default async function InventoryPage() {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [
    storagesRaw,
    categoriesRaw,
    itemsRaw,
    consumablesRaw,
    assetsRaw,
    transactionsRaw,
    peopleRaw,
    clinicsRaw,
    volunteersRaw,
  ] = await Promise.all([
    db
      .collection<StorageWithLocation>(DbTables.inventoryStorage)
      .find({})
      .sort({ createdAt: 1 })
      .toArray(),
    db
      .collection<InventoryCategoryDocument>(DbTables.inventoryCategories)
      .find({})
      .sort({ createdAt: 1 })
      .toArray(),
    db
      .collection(DbTables.inventoryItems)
      .find({})
      .sort({ createdAt: -1 })
      .toArray(),
    db.collection(DbTables.inventoryConsumables).find({}).toArray(),
    db.collection(DbTables.inventoryAssets).find({}).toArray(),
    db
      .collection(DbTables.inventoryTransactions)
      .find({})
      .sort({ date: -1 })
      .toArray(),
    db
      .collection<InventorySourceDocument>(DbTables.people)
      .find({}, { projection: { name: 1 } })
      .sort({ name: 1 })
      .toArray(),
    db
      .collection<InventorySourceDocument>(DbTables.clinics)
      .find({}, { projection: { name: 1 } })
      .sort({ name: 1 })
      .toArray(),
    db
      .collection<InventoryVolunteerDocument>(DbTables.users)
      .find({}, { projection: { email: 1 } })
      .sort({ email: 1 })
      .toArray(),
  ]);

  const storages = toTypedArray<StorageWithLocation>(storagesRaw);
  const categories = toTypedArray<InventoryCategoryDocument>(categoriesRaw);
  const items = toTypedArray<Record<string, unknown>>(itemsRaw);
  const consumables = toTypedArray<Record<string, unknown>>(consumablesRaw);
  const assets = toTypedArray<Record<string, unknown>>(assetsRaw);
  const transactions = toTypedArray<Record<string, unknown>>(transactionsRaw);
  const people = toTypedArray<InventorySourceDocument>(peopleRaw);
  const clinics = toTypedArray<InventorySourceDocument>(clinicsRaw);
  const volunteers = toTypedArray<InventoryVolunteerDocument>(volunteersRaw);

  const peopleById = new Map(
    people
      .map((person) => {
        const name = toText(person.name).trim();

        if (name.length === 0) {
          return null;
        }

        return [person._id.toString(), name] as const;
      })
      .filter((entry): entry is readonly [string, string] => entry !== null),
  );

  const clinicsById = new Map(
    clinics
      .map((clinic) => {
        const name = toText(clinic.name).trim();

        if (name.length === 0) {
          return null;
        }

        return [clinic._id.toString(), name] as const;
      })
      .filter((entry): entry is readonly [string, string] => entry !== null),
  );

  const volunteersById = new Map(
    volunteers
      .map((volunteer) => {
        const email = toText(volunteer.email).trim();

        if (email.length === 0) {
          return null;
        }

        return [volunteer._id.toString(), email] as const;
      })
      .filter((entry): entry is readonly [string, string] => entry !== null),
  );

  const storagesById = new Map(
    storages
      .map((storage) => {
        const name = toText(storage.name).trim();

        if (name.length === 0) {
          return null;
        }

        return [storage._id.toString(), name] as const;
      })
      .filter((entry): entry is readonly [string, string] => entry !== null),
  );

  const blockedStorageIds = new Set<string>();

  transactions.forEach((transaction) => {
    const from = toRecord(transaction.from);
    const to = toRecord(transaction.to);

    if (
      toText(from?.type) === 'storage' &&
      toObjectId(from?.id) instanceof ObjectId
    ) {
      blockedStorageIds.add(toObjectId(from?.id)?.toString() ?? '');
    }

    if (
      toText(to?.type) === 'storage' &&
      toObjectId(to?.id) instanceof ObjectId
    ) {
      blockedStorageIds.add(toObjectId(to?.id)?.toString() ?? '');
    }
  });

  const normalizedStorages: InventoryAdminViewProps['storages'] = storages.map(
    (storage) => ({
      id: storage._id.toString(),
      name: storage.name,
      latitude:
        typeof storage.location?.latitude === 'number'
          ? storage.location.latitude
          : null,
      longitude:
        typeof storage.location?.longitude === 'number'
          ? storage.location.longitude
          : null,
      createdAt: formatDateLabel(storage.createdAt),
      canDelete: !blockedStorageIds.has(storage._id.toString()),
    }),
  );

  const normalizedCategories = categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    inheritsFrom: category.inherits?.toString() ?? null,
    createdAt: formatDateLabel(category.createdAt),
  }));

  const knownCategoryIds = new Set(
    categories.map((category) => category._id.toString()),
  );

  const transactionsByEntityId = new Map<string, InventoryTransactionRow[]>();

  transactions.forEach((transaction) => {
    const entityObjectId = toObjectId(transaction.entityId);

    if (entityObjectId === null) {
      return;
    }

    const entityId = entityObjectId.toString();

    const from = toRecord(transaction.from);
    const to = toRecord(transaction.to);
    const currentTransactions = transactionsByEntityId.get(entityId) ?? [];

    const fromParty = buildTransactionParty(from, {
      peopleById,
      clinicsById,
      volunteersById,
      storagesById,
    });

    const toParty = buildTransactionParty(to, {
      peopleById,
      clinicsById,
      volunteersById,
      storagesById,
    });

    currentTransactions.push({
      id: toObjectId(transaction._id)?.toString() ?? '',
      type: toText(transaction.type),
      from: fromParty,
      to: toParty,
      quantity: toNumberOrNull(transaction.quantity),
      remainingQuantity: toNumberOrNull(transaction.remainingQuantity),
      estimatedCost: toNumberOrNull(transaction.estimatedCost),
      date: formatDateLabel(toDateInput(transaction.date)),
      condition: toText(transaction.condition),
      damageDescription: toText(transaction.damageDescription),
      notes: toText(transaction.notes),
      media: toTransactionMediaRows(transaction.media),
    });

    transactionsByEntityId.set(entityId, currentTransactions);
  });

  const entitiesByItemId = new Map<string, InventoryEntityRow[]>();

  consumables.forEach((consumable) => {
    const itemObjectId = toObjectId(consumable.itemId);

    if (itemObjectId === null) {
      return;
    }

    const itemId = itemObjectId.toString();

    const entityObjectId = toObjectId(consumable._id);

    if (entityObjectId === null) {
      return;
    }

    const entityId = entityObjectId.toString();

    const currentEntities = entitiesByItemId.get(itemId) ?? [];

    currentEntities.push({
      id: entityId,
      kind: 'consumable',
      serialNumber: '',
      individualId: '',
      batchNumber: toText(consumable.batchNumber),
      expiryDate: formatDateLabel(toDateInput(consumable.expiryDate)),
      unit: toText(consumable.unit),
      transactions: transactionsByEntityId.get(entityId) ?? [],
    });

    entitiesByItemId.set(itemId, currentEntities);
  });

  assets.forEach((asset) => {
    const itemObjectId = toObjectId(asset.itemId);

    if (itemObjectId === null) {
      return;
    }

    const itemId = itemObjectId.toString();

    const entityObjectId = toObjectId(asset._id);

    if (entityObjectId === null) {
      return;
    }

    const entityId = entityObjectId.toString();

    const currentEntities = entitiesByItemId.get(itemId) ?? [];

    currentEntities.push({
      id: entityId,
      kind: 'asset',
      serialNumber: toText(asset.serialNumber),
      individualId: toText(asset.individualId),
      batchNumber: '',
      expiryDate: '',
      unit: '',
      transactions: transactionsByEntityId.get(entityId) ?? [],
    });

    entitiesByItemId.set(itemId, currentEntities);
  });

  const itemsByCategoryId = new Map<string, InventoryItemRow[]>();

  items.forEach((item) => {
    const type = toText(item.type);

    if (type !== 'asset' && type !== 'consumable') {
      return;
    }

    const itemObjectId = toObjectId(item._id);

    if (itemObjectId === null) {
      return;
    }

    const itemId = itemObjectId.toString();

    const itemEntities = entitiesByItemId.get(itemId) ?? [];
    const entityCount = itemEntities.length;

    const totalQuantity =
      type === 'asset'
        ? entityCount
        : itemEntities.reduce((sum, entity) => {
          const latestTransaction = entity.transactions[0];
          const entityQuantity =
            latestTransaction?.remainingQuantity ??
            latestTransaction?.quantity ??
            0;

          return sum + entityQuantity;
        }, 0);

    const quantityUnit =
      type === 'consumable'
        ? (itemEntities.find((entity) => entity.unit.trim().length > 0)?.unit ??
          '')
        : '';

    const rawCategoryId = toObjectId(item.category)?.toString() ?? '';
    const categoryId =
      rawCategoryId.length > 0 && knownCategoryIds.has(rawCategoryId)
        ? rawCategoryId
        : 'uncategorized';

    const currentItems = itemsByCategoryId.get(categoryId) ?? [];

    currentItems.push({
      id: itemId,
      name: toText(item.name),
      type,
      entityCount,
      totalQuantity,
      quantityUnit,
      entities: itemEntities,
    });

    itemsByCategoryId.set(categoryId, currentItems);
  });

  const tableCategories = buildCategoryTree(categories).map((category) =>
    mapCategoryForTable(category, itemsByCategoryId),
  );

  const uncategorizedItems = itemsByCategoryId.get('uncategorized') ?? [];

  if (uncategorizedItems.length > 0) {
    tableCategories.push({
      id: 'uncategorized',
      name: 'Uncategorized',
      children: [],
      items: uncategorizedItems,
    });
  }

  const inventoryProps: InventoryAdminViewProps = {
    storages: normalizedStorages,
    categories: buildCategoryTree(categories),
    categoryOptions: normalizedCategories,
    peopleOptions: people
      .filter(
        (person): person is InventorySourceDocument & { name: string } =>
          typeof person.name === 'string' && person.name.trim().length > 0,
      )
      .map((person) => ({
        id: person._id.toString(),
        name: person.name.trim(),
      })),
    clinicOptions: clinics
      .filter(
        (clinic): clinic is InventorySourceDocument & { name: string } =>
          typeof clinic.name === 'string' && clinic.name.trim().length > 0,
      )
      .map((clinic) => ({
        id: clinic._id.toString(),
        name: clinic.name.trim(),
      })),
    volunteerOptions: volunteers
      .filter(
        (
          volunteer,
        ): volunteer is InventoryVolunteerDocument & { email: string } =>
          typeof volunteer.email === 'string' &&
          volunteer.email.trim().length > 0,
      )
      .map((volunteer) => ({
        id: volunteer._id.toString(),
        name: volunteer.email.trim(),
      })),
    tableCategories,
  };

  return <InventoryAdminView {...inventoryProps} />;
}
