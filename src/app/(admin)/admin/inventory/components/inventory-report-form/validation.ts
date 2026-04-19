import type { FormErrors } from '../../types/inventory-component-props.types';
import type { InventoryReportFormState } from '../../types/inventory.types';

type TranslateFn = (key: string) => string;

export function validateReportForm(
  state: InventoryReportFormState,
  t: TranslateFn,
): FormErrors {
  const errors: FormErrors = {};

  if (!state.name.trim()) {
    errors.name = t('reports.form.nameRequired');
  }

  if (state.type !== 'equipment' && state.type !== 'consumable') {
    errors.type = t('reports.form.typeRequired');
  }

  const quantity = Number(state.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.quantity = t('reports.form.quantityRequired');
  }

  if (!state.categoryId.trim()) {
    errors.categoryId = t('reports.form.categoryRequired');
  }

  if (!state.storageId.trim()) {
    errors.storageId = t('reports.form.storageRequired');
  }

  return errors;
}
