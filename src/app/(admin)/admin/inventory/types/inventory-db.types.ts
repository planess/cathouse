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

export type InventoryReportDocument = {
  _id: ObjectId;
  sku?: string;
  name: string;
  type?: 'equipment' | 'consumable';
  quantity: number;
  expirationDate?: Date;
  category?: ObjectId;
  storage?: ObjectId;
  images?: string[];
  createdAt?: Date;
};
