'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { ItemDetailsSection } from './inventory-acceptance-form/item-details-section';
import { MediaFilesSection } from './inventory-acceptance-form/media-files-section';
import { SourceSection } from './inventory-acceptance-form/source-section';
import { TransactionDetailsSection } from './inventory-acceptance-form/transaction-details-section';
import { validateAcceptanceForm } from './inventory-acceptance-form/validation';

import type {
  AcceptanceFormErrors,
  InventoryAcceptanceFormProps,
} from '../types/inventory-component-props.types';

export function InventoryAcceptanceForm({
  initialState,
  storages,
  categoryTree,
  peopleOptions,
  clinicOptions,
  volunteerOptions,
  onChange,
  onValidityChange,
}: InventoryAcceptanceFormProps) {
  const t = useTranslations('adminInventory');
  const [formState, setFormState] = useState(initialState);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo(
    () => validateAcceptanceForm(formState, t),
    [formState, t],
  );
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  const updateState = (nextState: typeof initialState) => {
    setFormState(nextState);
    onChange(nextState);
    onValidityChange(
      Object.keys(validateAcceptanceForm(nextState, t)).length === 0,
    );
  };

  const markTouched = (field: keyof AcceptanceFormErrors) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const visibleError = (field: keyof AcceptanceFormErrors) => {
    return touched[field] ? (errors[field] ?? '') : '';
  };

  return (
    <form className="space-y-4">
      <ItemDetailsSection
        formState={formState}
        categoryTree={categoryTree}
        updateState={updateState}
        markTouched={markTouched}
        visibleError={visibleError}
      />

      <SourceSection
        formState={formState}
        peopleOptions={peopleOptions}
        clinicOptions={clinicOptions}
        volunteerOptions={volunteerOptions}
        updateState={updateState}
        markTouched={markTouched}
        visibleError={visibleError}
      />

      <TransactionDetailsSection
        formState={formState}
        storages={storages}
        updateState={updateState}
        markTouched={markTouched}
        visibleError={visibleError}
      />

      <MediaFilesSection formState={formState} updateState={updateState} />
    </form>
  );
}
