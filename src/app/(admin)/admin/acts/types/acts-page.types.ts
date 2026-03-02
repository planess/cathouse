import { ObjectId } from 'mongodb';

import type { MediaAsset } from '@app/models/media-asset';

import { InventoryItemCondition } from '../../inventory/types/inventory-db.types';

export type ActStatus = 'scheduled' | 'pending' | 'approved' | 'rejected';

export type EquipmentEntry = {
  itemId: ObjectId;
  conditionBefore: InventoryItemCondition;
  conditionAfter: InventoryItemCondition;
  notes?: string;
  media?: MediaAsset[];
};

export type DbVolunteerAct = {
  _id: ObjectId;
  volunteerId: ObjectId;
  types: ObjectId;
  status: ActStatus;
  animalId?: ObjectId[];
  notes?: string;
  managedBy?: ObjectId;
  managedAt?: Date;
  equipments?: EquipmentEntry[];
  documents?: MediaAsset[];
  sessionStart: Date;
  sessionEnd: Date;
  createdAt: Date;
  createdBy: ObjectId;
};

export type DbVolunteerCategory = {
  _id: ObjectId;
  name: string;
};

export type DbAnimal = {
  _id: ObjectId;
  name: string;
};

export type DbVolunteer = {
  _id: ObjectId;
  email: string;
  isActive?: boolean;
};
