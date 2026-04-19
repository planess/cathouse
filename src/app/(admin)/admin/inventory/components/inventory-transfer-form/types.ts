import type { FormErrors } from '../../types/inventory-component-props.types';
import type { InventoryTransferFormState } from '../../types/inventory.types';

export type TransferTouchedState = {
  toId: boolean;
  quantity: boolean;
  transactionDate: boolean;
  estimatedCost: boolean;
};

export type VisibleTransferErrors = {
  toId: string;
  quantity: string;
  transactionDate: string;
  estimatedCost: string;
};

export type UpdateTransferState = (
  nextState: InventoryTransferFormState,
) => void;

export function buildVisibleTransferErrors(
  touched: TransferTouchedState,
  errors: FormErrors,
): VisibleTransferErrors {
  const toIdError = typeof errors.toId === 'string' ? errors.toId : '';
  const quantityError =
    typeof errors.quantity === 'string' ? errors.quantity : '';
  const transactionDateError =
    typeof errors.transactionDate === 'string' ? errors.transactionDate : '';
  const estimatedCostError =
    typeof errors.estimatedCost === 'string' ? errors.estimatedCost : '';

  return {
    toId: touched.toId ? toIdError : '',
    quantity: touched.quantity ? quantityError : '',
    transactionDate: touched.transactionDate ? transactionDateError : '',
    estimatedCost: touched.estimatedCost ? estimatedCostError : '',
  };
}
