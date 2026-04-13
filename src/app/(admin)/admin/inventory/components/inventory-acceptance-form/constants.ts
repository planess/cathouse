import type {
  InventoryAcceptanceCondition,
  InventoryAcceptanceFromType,
  InventoryAcceptanceItemType,
  InventoryAcceptanceTransactionType,
} from '../../types/inventory.types';

export const ITEM_TYPE_OPTIONS: Array<{
  value: InventoryAcceptanceItemType;
  label: string;
}> = [
  { value: 'consumable', label: 'Consumable' },
  { value: 'asset', label: 'Asset' },
];

export const TRANSACTION_TYPE_OPTIONS: Array<{
  value: InventoryAcceptanceTransactionType;
  label: string;
}> = [
  { value: 'donation', label: 'Donation' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'transfer', label: 'Transfer' },
];

export const FROM_TYPE_OPTIONS: Array<{
  value: InventoryAcceptanceFromType;
  label: string;
}> = [
  { value: 'people', label: 'People' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'shop', label: 'Shop' },
  { value: 'organization', label: 'Organization' },
  { value: 'volunteer', label: 'Volunteer' },
];

export const CONDITION_OPTIONS: Array<{
  value: InventoryAcceptanceCondition;
  label: string;
}> = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'broken', label: 'Broken' },
];

export const DOCUMENT_AND_IMAGE_ACCEPT =
  'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf';
