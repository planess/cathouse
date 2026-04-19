import type { InventoryAcceptanceFormState } from '../../types/inventory.types';

export function buildAcceptanceFormData(state: InventoryAcceptanceFormState) {
  const formData = new FormData();

  formData.set('itemType', state.itemType);
  formData.set('name', state.name);
  formData.set('categoryId', state.categoryId);
  formData.set('batchNumber', state.batchNumber);
  formData.set('expiryDate', state.expiryDate);
  formData.set('unit', state.unit);
  formData.set('serialNumber', state.serialNumber);
  formData.set('individualId', state.individualId);
  formData.set('transactionType', state.transactionType);
  formData.set('fromType', state.fromType);
  formData.set('fromId', state.fromId);
  formData.set('fromName', state.fromName);
  formData.set('toStorageId', state.toStorageId);
  formData.set('quantity', state.quantity);
  formData.set('remainingQuantity', state.remainingQuantity);
  formData.set('transactionDate', state.transactionDate);
  formData.set('condition', state.condition);
  formData.set('damageDescription', state.damageDescription);
  formData.set('notes', state.notes);
  formData.set('estimatedCost', state.estimatedCost);

  state.mediaFiles.forEach((file) => {
    formData.append('media', file);
  });

  return formData;
}
