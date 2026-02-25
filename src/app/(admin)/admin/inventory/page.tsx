import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';

import { InventoryAdminView } from './components/inventory-admin-view';
import {
  buildCategoryTree,
  formatDateLabel,
} from './helpers/inventory-helpers';
import { StorageWithLocation } from './types/inventory-page.types';

import type {
  InventoryCategoryDocument,
  InventoryReportDocument,
} from './types/inventory-db.types';
import type { InventoryAdminViewProps } from './types/inventory.types';

export default async function InventoryPage() {
  const dbClient = await clientPromise;
  const db = dbClient.db();

  const [storages, categories, reports] = await Promise.all([
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
      .collection<InventoryReportDocument>(DbTables.reportsInventory)
      .find({})
      .sort({ createdAt: -1 })
      .toArray(),
  ]);

  const storageMap = new Map(
    storages.map((storage) => [storage._id.toString(), storage.name]),
  );

  const categoryMap = new Map(
    categories.map((category) => [category._id.toString(), category.name]),
  );

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
    }),
  );

  const normalizedCategories = categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    inheritsFrom: category.inherits?.toString() ?? null,
    createdAt: formatDateLabel(category.createdAt),
  }));

  const normalizedReports: InventoryAdminViewProps['reports'] = reports.map(
    (report) => {
      const storageId = report.storage?.toString() ?? null;
      const categoryId = report.category?.toString() ?? null;

      return {
        id: report._id.toString(),
        sku: report.sku ?? '',
        name: report.name ?? '',
        type: report.type ?? '',
        quantity: report.quantity ?? 0,
        categoryId,
        categoryName:
          typeof categoryId === 'string' && categoryId.length > 0
            ? (categoryMap.get(categoryId) ?? '')
            : '',
        storageId,
        storageName:
          typeof storageId === 'string' && storageId.length > 0
            ? (storageMap.get(storageId) ?? '')
            : '',
        expirationDate: formatDateLabel(report.expirationDate),
        expirationDateValue: report.expirationDate
          ? report.expirationDate.toISOString().slice(0, 10)
          : '',
        images: Array.isArray(report.images)
          ? report.images.filter((url) => typeof url === 'string')
          : [],
        createdAt: formatDateLabel(report.createdAt),
      };
    },
  );

  const inventoryProps: InventoryAdminViewProps = {
    storages: normalizedStorages,
    categories: buildCategoryTree(categories),
    categoryOptions: normalizedCategories,
    reports: normalizedReports,
  };

  return <InventoryAdminView {...inventoryProps} />;
}
