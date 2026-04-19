export type InventoryStorageRow = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  canDelete: boolean;
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

export type InventoryTransactionRow = {
  id: string;
  type: string;
  from: InventoryTransactionPartyRow;
  to: InventoryTransactionPartyRow;
  quantity: number | null;
  remainingQuantity: number | null;
  estimatedCost: number | null;
  date: string;
  condition: string;
  notes: string;
  damageDescription?: string;
  media: InventoryTransactionMediaRow[];
};

export type InventoryTransactionMediaRow = {
  key: string;
  url: string;
  size?: number;
  mimeType?: string;
  originalName?: string;
  uploadedAt: string;
  isDeleted?: boolean;
  checksum: string;
};

type InventoryTransactionPartyReference =
  | {
      id: string;
      name?: string;
    }
  | {
      id?: string;
      name: string;
    };

export type InventoryTransactionPartyRow = {
  type: string;
} & InventoryTransactionPartyReference;

export type InventoryEntityRow = {
  id: string;
  kind: 'asset' | 'consumable';
  serialNumber: string;
  individualId: string;
  batchNumber: string;
  expiryDate: string;
  unit: string;
  transactions: InventoryTransactionRow[];
};

export type InventoryItemRow = {
  id: string;
  name: string;
  type: 'asset' | 'consumable';
  entityCount: number;
  totalQuantity: number;
  quantityUnit: string;
  entities: InventoryEntityRow[];
};

export type InventoryTableCategoryNode = {
  id: string;
  name: string;
  children: InventoryTableCategoryNode[];
  items: InventoryItemRow[];
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

export type InventoryAcceptanceItemType = 'consumable' | 'asset';

export type InventoryAcceptanceTransactionType =
  | 'donation'
  | 'purchase'
  | 'transfer';

export type InventoryAcceptanceFromType =
  | 'people'
  | 'clinic'
  | 'shop'
  | 'organization'
  | 'volunteer';

export type InventoryAcceptanceCondition =
  | 'new'
  | 'good'
  | 'fair'
  | 'poor'
  | 'broken';

export type InventoryTransferTransactionType =
  | 'transfer'
  | 'release'
  | 'disposal';

export type InventoryTransferToType =
  | 'people'
  | 'clinic'
  | 'volunteer'
  | 'storage';

export type InventoryTransferPartyType = InventoryTransferToType;

export type InventoryTransferCondition = 'good' | 'fair' | 'poor' | 'broken';

export type InventorySourceOption = {
  id: string;
  name: string;
};

export type InventoryAcceptanceFormState = {
  itemType: InventoryAcceptanceItemType;
  name: string;
  categoryId: string;
  batchNumber: string;
  expiryDate: string;
  unit: string;
  serialNumber: string;
  individualId: string;
  transactionType: InventoryAcceptanceTransactionType;
  fromType: InventoryAcceptanceFromType;
  fromId: string;
  fromName: string;
  toStorageId: string;
  quantity: string;
  remainingQuantity: string;
  transactionDate: string;
  condition: InventoryAcceptanceCondition;
  damageDescription: string;
  notes: string;
  estimatedCost: string;
  mediaFiles: File[];
};

export type InventoryTransferFormState = {
  entityId: string;
  itemKind: 'asset' | 'consumable';
  transactionType: InventoryTransferTransactionType;
  fromType: InventoryTransferPartyType;
  fromId: string;
  fromName: string;
  toType: InventoryTransferToType;
  toId: string;
  quantity: string;
  previousRemainingQuantity: string;
  transactionDate: string;
  condition: InventoryTransferCondition;
  damageDescription: string;
  notes: string;
  estimatedCost: string;
  mediaFiles: File[];
};

export type InventoryItemType = 'equipment' | 'consumable' | 'asset';

export type InventoryConsumability = 'reusable' | 'single_use' | 'multi_use';

export type InventoryAdminViewProps = {
  storages: InventoryStorageRow[];
  categories: InventoryCategoryNode[];
  categoryOptions: InventoryCategoryOption[];
  peopleOptions: InventorySourceOption[];
  clinicOptions: InventorySourceOption[];
  volunteerOptions: InventorySourceOption[];
  tableCategories: InventoryTableCategoryNode[];
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
