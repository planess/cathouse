import type { InventoryTransferFormState } from '../../types/inventory.types';

export function buildTransferFormData(state: InventoryTransferFormState) {
  const formData = new FormData();

  formData.set('entityId', state.entityId);
  formData.set('itemKind', state.itemKind);
  formData.set('transactionType', state.transactionType);
  formData.set('fromType', state.fromType);
  formData.set('fromId', state.fromId);
  formData.set('fromName', state.fromName);
  formData.set('toType', state.toType);
  formData.set('toId', state.toId);
  formData.set('quantity', state.quantity);
  formData.set('previousRemainingQuantity', state.previousRemainingQuantity);
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
