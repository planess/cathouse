import type { FormErrors } from '../../types/inventory-component-props.types';
import type { InventoryTransferFormState } from '../../types/inventory.types';

type TranslateFn = (key: string) => string;

export function validateTransferForm(
  state: InventoryTransferFormState,
  t: TranslateFn,
): FormErrors {
  const errors: FormErrors = {};

  if (state.transactionType !== 'disposal' && !state.toId.trim()) {
    errors.toId = t('transfers.form.toRequired');
  }

  const quantity = Number(state.quantity);
  const maximumQuantity = Number(state.previousRemainingQuantity);

  if (!Number.isFinite(quantity) || quantity > maximumQuantity) {
    errors.quantity = t('transfers.form.quantityInvalid');
  }

  if (
    !state.transactionDate.trim() ||
    Number.isNaN(new Date(state.transactionDate).getTime())
  ) {
    errors.transactionDate = t('transfers.form.dateRequired');
  }

  const estimatedCost = Number(state.estimatedCost);

  if (!Number.isFinite(estimatedCost) || estimatedCost < 0) {
    errors.estimatedCost = t('transfers.form.estimatedCostInvalid');
  }

  return errors;
}
