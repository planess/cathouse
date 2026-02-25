export type InventoryStorageRow = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
};

export type InventoryCategoryNode = {
  id: string;
  name: string;
  createdAt: string;
  children: InventoryCategoryNode[];
};

export type InventoryCategoryOption = {
  id: string;
  name: string;
  inheritsFrom: string | null;
  createdAt: string;
};

export type InventoryReportRow = {
  id: string;
  sku: string;
  name: string;
  type: InventoryItemType | '';
  quantity: number;
  categoryId: string | null;
  categoryName: string;
  storageId: string | null;
  storageName: string;
  expirationDate: string;
  expirationDateValue: string;
  images: string[];
  createdAt: string;
};

export type InventoryReportFormState = {
  sku: string;
  name: string;
  type: InventoryItemType | '';
  quantity: string;
  expirationDate: string;
  categoryId: string;
  storageId: string;
  existingImages: string[];
  newImages: File[];
};

export type InventoryItemType = 'equipment' | 'consumable';

export type InventoryAdminViewProps = {
  storages: InventoryStorageRow[];
  categories: InventoryCategoryNode[];
  categoryOptions: InventoryCategoryOption[];
  reports: InventoryReportRow[];
};

export type StorageFormState = {
  name: string;
  latitude: number | null;
  longitude: number | null;
};

export type MapCoordinates = {
  latitude: number | null;
  longitude: number | null;
};

export type CategoryFormState = {
  name: string;
  inheritsId: string;
};

export type InventoryCategoryRow = {
  id: string;
  name: string;
  createdAt: string;
  parentName: string;
  depth: number;
  hasChildren: boolean;
};
