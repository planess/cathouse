import type { InventoryItemCondition } from '@app/(admin)/admin/inventory/types/inventory-db.types';
import type { MediaAsset } from '@app/models/media-asset';

import type { ObjectId } from 'mongodb';

export type ActStatus = 'scheduled' | 'pending' | 'approved' | 'rejected';

export type EquipmentInput = {
  itemId: string;
  conditionBefore: InventoryItemCondition;
  conditionAfter: InventoryItemCondition;
  notes?: string;
  media?: MediaAsset[];
};

export type VolunteerActDocument = {
  _id: ObjectId;
  volunteerId: ObjectId;
  types: ObjectId;
  status: ActStatus;
  animalId?: ObjectId[];
  notes?: string;
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
  sessionStart: Date;
  sessionEnd: Date;
  createdAt: Date;
  createdBy: ObjectId;
};

export type VolunteerCategoryOption = {
  id: string;
  name: string;
};

export type AnimalOption = {
  id: string;
  name: string;
};

export type UserOption = {
  id: string;
  email: string;
};

export type EquipmentOption = {
  id: string;
  name: string;
};

export type VolunteerActRow = {
  id: string;
  typeId: string;
  typeName: string;
  status: ActStatus;
  animalIds: string[];
  animalNames: string[];
  notes: string;
  sessionStart: string;
  sessionEnd: string;
  createdAt: string;
  equipments: EquipmentInput[];
  documentsCount: number;
};

export type ActsPageViewProps = {
  acts: VolunteerActRow[];
  categories: VolunteerCategoryOption[];
  animals: AnimalOption[];
  equipmentOptions: EquipmentOption[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};
