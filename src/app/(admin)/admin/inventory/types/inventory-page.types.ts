import { InventoryStorageDocument } from './inventory-db.types';

export type StorageWithLocation = InventoryStorageDocument & {
  location?: {
    latitude?: number;
    longitude?: number;
  };
};
