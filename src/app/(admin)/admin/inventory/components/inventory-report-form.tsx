'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { DetailsSection } from './inventory-report-form/details-section';
import { IdentitySection } from './inventory-report-form/identity-section';
import { ImagesSection } from './inventory-report-form/images-section';
import {
  buildVisibleReportErrors,
  type ReportTouchedState,
} from './inventory-report-form/types';
import { validateReportForm } from './inventory-report-form/validation';

import type { InventoryReportFormProps } from '../types/inventory-component-props.types';

const INITIAL_TOUCHED_STATE: ReportTouchedState = {
  name: false,
  type: false,
  quantity: false,
  categoryId: false,
  storageId: false,
};

export function InventoryReportForm({
  initialState,
  storages,
  categories,
  onChange,
  onValidityChange,
}: InventoryReportFormProps) {
  const t = useTranslations('adminInventory');
  const [formState, setFormState] = useState(initialState);
  const [touched, setTouched] = useState(INITIAL_TOUCHED_STATE);

  const errors = useMemo(() => validateReportForm(formState, t), [formState, t]);
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  const updateState = (nextState: typeof initialState) => {
    setFormState(nextState);
    onChange(nextState);
    onValidityChange(Object.keys(validateReportForm(nextState, t)).length === 0);
  };

  const visibleErrors = buildVisibleReportErrors(touched, errors);

  return (
    <form className="space-y-4">
      <IdentitySection
        formState={formState}
        visibleErrors={visibleErrors}
        updateState={updateState}
        onNameBlur={() => setTouched((current) => ({ ...current, name: true }))}
      />

      <DetailsSection
        formState={formState}
        storages={storages}
        categories={categories}
        visibleErrors={visibleErrors}
        updateState={updateState}
        onTypeBlur={() => setTouched((current) => ({ ...current, type: true }))}
        onQuantityBlur={() =>
          setTouched((current) => ({ ...current, quantity: true }))
        }
        onCategoryBlur={() =>
          setTouched((current) => ({ ...current, categoryId: true }))
        }
        onStorageBlur={() =>
          setTouched((current) => ({ ...current, storageId: true }))
        }
      />

      <ImagesSection formState={formState} updateState={updateState} />
    </form>
  );
}
