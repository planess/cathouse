import type { InventoryAcceptanceFormState } from '../../types/inventory.types';

export function createAcceptanceInitialState(): InventoryAcceptanceFormState {
  return {
    itemType: 'consumable',
    name: '',
    categoryId: '',
    batchNumber: '',
    expiryDate: '',
    unit: '',
    serialNumber: '',
    individualId: '',
    transactionType: 'donation',
    fromType: 'people',
    fromId: '',
    fromName: '',
    toStorageId: '',
    quantity: '1',
    remainingQuantity: '1',
    transactionDate: new Date().toISOString().slice(0, 16),
    condition: 'new',
    damageDescription: '',
    notes: '',
    estimatedCost: '0',
    mediaFiles: [],
  };
}
