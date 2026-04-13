'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { TransferDetailsSection } from './inventory-transfer-form/details-section';
import {
  buildVisibleTransferErrors,
  type TransferTouchedState,
} from './inventory-transfer-form/types';
import { validateTransferForm } from './inventory-transfer-form/validation';

import type { InventoryTransferFormProps } from '../types/inventory-component-props.types';

const INITIAL_TOUCHED_STATE: TransferTouchedState = {
  toId: false,
  quantity: false,
  transactionDate: false,
  estimatedCost: false,
};

export function InventoryTransferForm({
  initialState,
  storages,
  peopleOptions,
  clinicOptions,
  volunteerOptions,
  onChange,
  onValidityChange,
}: InventoryTransferFormProps) {
  const t = useTranslations('adminInventory');
  const [formState, setFormState] = useState(initialState);
  const [touched, setTouched] = useState(INITIAL_TOUCHED_STATE);

  const errors = useMemo(() => validateTransferForm(formState, t), [formState, t]);
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  const updateState = (nextState: typeof initialState) => {
    setFormState(nextState);
    onChange(nextState);
    onValidityChange(Object.keys(validateTransferForm(nextState, t)).length === 0);
  };

  const visibleErrors = buildVisibleTransferErrors(touched, errors);

  return (
    <form className="space-y-4">
      <TransferDetailsSection
        formState={formState}
        storages={storages}
        peopleOptions={peopleOptions}
        clinicOptions={clinicOptions}
        volunteerOptions={volunteerOptions}
        visibleErrors={visibleErrors}
        updateState={updateState}
        onToBlur={() => setTouched((current) => ({ ...current, toId: true }))}
        onQuantityBlur={() =>
          setTouched((current) => ({ ...current, quantity: true }))
        }
        onDateBlur={() =>
          setTouched((current) => ({ ...current, transactionDate: true }))
        }
        onEstimatedCostBlur={() =>
          setTouched((current) => ({ ...current, estimatedCost: true }))
        }
      />
    </form>
  );
}
