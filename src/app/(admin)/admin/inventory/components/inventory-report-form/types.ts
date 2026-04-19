import type { FormErrors } from '../../types/inventory-component-props.types';
import type { InventoryReportFormState } from '../../types/inventory.types';

export type ReportTouchedState = {
  name: boolean;
  type: boolean;
  quantity: boolean;
  categoryId: boolean;
  storageId: boolean;
};

export type VisibleReportErrors = {
  name: string;
  type: string;
  quantity: string;
  categoryId: string;
  storageId: string;
};

export type UpdateReportState = (nextState: InventoryReportFormState) => void;

export function buildVisibleReportErrors(
  touched: ReportTouchedState,
  errors: FormErrors,
): VisibleReportErrors {
  return {
    name: touched.name ? (errors.name ?? '') : '',
    type: touched.type ? (errors.type ?? '') : '',
    quantity: touched.quantity ? (errors.quantity ?? '') : '',
    categoryId: touched.categoryId ? (errors.categoryId ?? '') : '',
    storageId: touched.storageId ? (errors.storageId ?? '') : '',
  };
}
