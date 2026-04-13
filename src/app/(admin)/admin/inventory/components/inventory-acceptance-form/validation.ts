import type { AcceptanceFormErrors } from '../../types/inventory-component-props.types';
import type { InventoryAcceptanceFormState } from '../../types/inventory.types';

type TranslateFn = (key: string) => string;

export function validateAcceptanceForm(
  state: InventoryAcceptanceFormState,
  t: TranslateFn,
): AcceptanceFormErrors {
  const errors: AcceptanceFormErrors = {};

  if (!state.name.trim()) {
    errors.name = t('reports.form.nameRequired');
  }

  if (!state.categoryId.trim()) {
    errors.categoryId = t('reports.form.categoryRequired');
  }

  if (state.itemType === 'consumable') {
    if (!state.batchNumber.trim()) {
      errors.batchNumber = 'Batch number is required.';
    }

    if (!state.unit.trim()) {
      errors.unit = 'Unit is required.';
    }

    const quantity = Number(state.quantity);
    const remainingQuantity = Number(state.remainingQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      errors.quantity = t('reports.form.quantityRequired');
    }

    if (!Number.isInteger(remainingQuantity) || remainingQuantity <= 0) {
      errors.remainingQuantity = 'Remaining quantity must be greater than zero.';
    }
  }

  if (state.itemType === 'asset') {
    if (!state.serialNumber.trim()) {
      errors.serialNumber = 'Serial number is required.';
    }

    if (!state.individualId.trim()) {
      errors.individualId = 'Individual ID is required.';
    }
  }

  if (state.fromType === 'shop' || state.fromType === 'organization') {
    if (!state.fromName.trim()) {
      errors.fromName = 'Source name is required.';
    }
  } else if (!state.fromId.trim()) {
    errors.fromId = 'Source selection is required.';
  }

  if (!state.toStorageId.trim()) {
    errors.toStorageId = t('reports.form.storageRequired');
  }

  if (
    !state.transactionDate.trim() ||
    Number.isNaN(new Date(state.transactionDate).getTime())
  ) {
    errors.transactionDate = 'Transaction date and time is required.';
  }

  const estimatedCost = Number(state.estimatedCost);
  if (!Number.isFinite(estimatedCost) || estimatedCost < 0) {
    errors.estimatedCost = 'Estimated cost must be zero or more.';
  }

  return errors;
}
