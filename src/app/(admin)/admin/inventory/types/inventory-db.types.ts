import { type ObjectId } from 'mongodb';

type GeoPoint = {
  latitude?: number;
  longitude?: number;
};

export type InventoryStorageDocument = {
  _id: ObjectId;
  name: string;
  location?: GeoPoint;
  createdAt?: Date;
};

export type InventoryCategoryDocument = {
  _id: ObjectId;
  name: string;
  inherits?: ObjectId;
  createdAt?: Date;
};

export type InventoryItemStatus =
  | 'on_balance'
  | 'in_use'
  | 'transferred'
  | 'written_off'
  | 'reserved';

export type InventoryItemCondition =
  | 'new'
  | 'good'
  | 'fair'
  | 'poor'
  | 'broken';

export type InventoryConsumability = 'reusable' | 'single_use' | 'multi_use';

export type EquipmentUsageEntry = {
  usedBy: ObjectId;
  purpose: string;
  startedAt: Date;
  endedAt?: Date;
  notes?: string;
};

export type EquipmentTransitionEntry = {
  type: 'acceptance' | 'release';
  fromType?: 'user' | 'storage';
  fromId?: ObjectId;
  toType?: 'user' | 'storage';
  toId?: ObjectId;
  reason?: string;
  notes?: string;
  date: Date;
  performedBy: ObjectId;
};

export type InventoryReportDocument = {
  _id: ObjectId;
  sku?: string;
  name: string;
  type?: 'equipment' | 'consumable' | 'asset';
  consumability?: InventoryConsumability;
  quantity: number;
  status?: InventoryItemStatus;
  condition?: InventoryItemCondition;
  assignedTo?: ObjectId;
  purchaseDate?: Date;
  purchasePrice?: number;
  expirationDate?: Date;
  category?: ObjectId;
  storage?: ObjectId;
  images?: string[];
  usage?: EquipmentUsageEntry[];
  transitions?: EquipmentTransitionEntry[];
  createdAt?: Date;
  createdBy?: ObjectId;
};

export type InventoryTransactionDocument = {
  _id: ObjectId;
  from?: ObjectId;
  to?: ObjectId;
};
