'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type {
  CategoryFormState,
  InventoryCategoryOption,
} from '../types/inventory.types';

export function CategoryForm({
  initialState,
  options,
  onChange,
  onValidityChange,
}: {
  initialState: CategoryFormState;
  options: InventoryCategoryOption[];
  onChange: (state: CategoryFormState) => void;
  onValidityChange: (isValid: boolean) => void;
}) {
  const t = useTranslations('adminInventory');
  const [formState, setFormState] = useState<CategoryFormState>(initialState);
  const [touched, setTouched] = useState({ name: false });

  const errors = validateCategoryForm(formState, t);
  const isValid = Object.keys(errors).length === 0;
  const nameError = touched.name ? errors.name : '';

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  const updateState = (nextState: CategoryFormState) => {
    setFormState(nextState);
    onChange(nextState);
    onValidityChange(
      Object.keys(validateCategoryForm(nextState, t)).length === 0,
    );
  };

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          {t('categories.form.nameLabel')}
        </label>
        <input
          className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
            nameError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
          }`}
          value={formState.name}
          onChange={(event) =>
            updateState({ ...formState, name: event.target.value })
          }
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          type="text"
          placeholder={t('categories.form.namePlaceholder')}
        />
        {nameError ? (
          <p className="text-xs text-rose-500">{nameError}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          {t('categories.form.parentLabel')}
        </label>
        <select
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          value={formState.inheritsId}
          onChange={(event) =>
            updateState({ ...formState, inheritsId: event.target.value })
          }
        >
          <option value="">{t('categories.form.parentPlaceholder')}</option>
          {options.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}

function validateCategoryForm(
  state: CategoryFormState,
  t: (key: string) => string,
) {
  const errors: { name?: string } = {};
  const name = state.name.trim();

  if (!name) {
    errors.name = t('categories.form.nameRequired');
  }

  return errors;
}
