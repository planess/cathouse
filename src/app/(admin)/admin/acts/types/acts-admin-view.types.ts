import type { MediaAsset } from '@app/models/media-asset';

import { InventoryItemCondition } from '../../inventory/types/inventory-db.types';

import { ActStatus } from './acts-page.types';

export type EquipmentRow = {
  itemId: string;
  itemName: string;
  conditionBefore: InventoryItemCondition;
  conditionAfter: InventoryItemCondition;
  notes: string;
  media: MediaAsset[];
};

export type ActRow = {
  id: string;
  volunteerId: string;
  volunteerEmail: string;
  typeId: string;
  typeName: string;
  status: ActStatus;
  notes: string;
  animals: string[];
  documents: MediaAsset[];
  equipments: EquipmentRow[];
  sessionStart: string;
  sessionEnd: string;
  managedByEmail: string;
  managedAt: string;
  createdAt: string;
};

export type VolunteerGroup = {
  volunteerId: string;
  volunteerEmail: string;
  acts: ActRow[];
};

export type ActsAdminViewProps = {
  groups: VolunteerGroup[];
};

export const ACT_STATUS_LABELS: Record<ActStatus, string> = {
  scheduled: 'Scheduled',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};
