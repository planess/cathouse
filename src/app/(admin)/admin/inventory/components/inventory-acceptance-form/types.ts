import type { AcceptanceFormErrors } from '../../types/inventory-component-props.types';
import type { InventoryAcceptanceFormState } from '../../types/inventory.types';

export type UpdateAcceptanceState = (
  nextState: InventoryAcceptanceFormState,
) => void;

export type VisibleAcceptanceError = (
  field: keyof AcceptanceFormErrors,
) => string;

export type MarkAcceptanceTouched = (
  field: keyof AcceptanceFormErrors,
) => void;
