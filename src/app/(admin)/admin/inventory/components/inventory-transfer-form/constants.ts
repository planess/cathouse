import type {
  InventoryTransferCondition,
  InventoryTransferToType,
  InventoryTransferTransactionType,
} from '../../types/inventory.types';

export const TRANSFER_TRANSACTION_TYPE_OPTIONS: Array<{
  value: InventoryTransferTransactionType;
  label: string;
}> = [
  { value: 'transfer', label: 'Transfer' },
  { value: 'release', label: 'Release' },
  { value: 'disposal', label: 'Disposal' },
];

export const TRANSFER_TO_TYPE_OPTIONS: Array<{
  value: InventoryTransferToType;
  label: string;
}> = [
  { value: 'people', label: 'People' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'storage', label: 'Storage' },
];

export const TRANSFER_CONDITION_OPTIONS: Array<{
  value: InventoryTransferCondition;
  label: string;
}> = [
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'broken', label: 'Broken' },
];
