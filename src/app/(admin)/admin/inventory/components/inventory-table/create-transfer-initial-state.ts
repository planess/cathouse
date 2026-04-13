import type {
  InventoryEntityRow,
  InventoryTransferCondition,
  InventoryTransferFormState,
  InventoryTransferPartyType,
} from '../../types/inventory.types';

function normalizePartyType(value: string): InventoryTransferPartyType {
  if (
    value === 'people' ||
    value === 'clinic' ||
    value === 'volunteer' ||
    value === 'storage'
  ) {
    return value;
  }

  return 'storage';
}

function normalizeCondition(value: string): InventoryTransferCondition {
  if (value === 'good' || value === 'fair' || value === 'poor' || value === 'broken') {
    return value;
  }

  return 'good';
}

export function createTransferInitialState(
  entity: InventoryEntityRow,
): InventoryTransferFormState {
  const latestTransaction = entity.transactions[0];
  const fromType = normalizePartyType(latestTransaction?.to.type ?? 'storage');
  const fromName = latestTransaction?.to.name?.trim() ?? latestTransaction?.to.id ?? '';
  const previousRemainingQuantity =
    latestTransaction?.remainingQuantity ?? latestTransaction?.quantity ?? 1;
  const estimatedCost = latestTransaction?.estimatedCost ?? 0;

  return {
    entityId: entity.id,
    itemKind: entity.kind,
    transactionType: 'transfer',
    fromType,
    fromId: latestTransaction?.to.id ?? '',
    fromName,
    toType: 'storage',
    toId: '',
    quantity: String(previousRemainingQuantity),
    previousRemainingQuantity: String(previousRemainingQuantity),
    transactionDate: new Date().toISOString().slice(0, 16),
    condition: normalizeCondition(latestTransaction?.condition ?? ''),
    damageDescription: '',
    notes: '',
    estimatedCost: String(estimatedCost),
    mediaFiles: [],
  };
}
