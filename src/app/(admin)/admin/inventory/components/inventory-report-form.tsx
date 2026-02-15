'use client';

import { useTranslations } from 'next-intl';
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';

import type {
  InventoryCategoryOption,
  InventoryStorageRow,
} from '../types/inventory.types';

export type InventoryReportFormState = {
  sku: string;
  name: string;
  type: 'equipment' | 'consumable' | '';
  quantity: string;
  expirationDate: string;
  categoryId: string;
  storageId: string;
  existingImages: string[];
  newImages: File[];
};

type InventoryReportFormProps = {
  initialState: InventoryReportFormState;
  storages: InventoryStorageRow[];
  categories: InventoryCategoryOption[];
  onChange: (state: InventoryReportFormState) => void;
  onValidityChange: (isValid: boolean) => void;
};

type FormErrors = {
  name?: string;
  type?: string;
  quantity?: string;
  categoryId?: string;
  storageId?: string;
};

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function InventoryReportForm({
  initialState,
  storages,
  categories,
  onChange,
  onValidityChange,
}: InventoryReportFormProps) {
  const t = useTranslations('adminInventory');
  const [formState, setFormState] =
    useState<InventoryReportFormState>(initialState);
  const [touched, setTouched] = useState({
    name: false,
    type: false,
    quantity: false,
    categoryId: false,
    storageId: false,
  });

  const errors = useMemo(() => validateForm(formState, t), [formState, t]);
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  const updateState = (nextState: InventoryReportFormState) => {
    setFormState(nextState);
    onChange(nextState);
    onValidityChange(Object.keys(validateForm(nextState, t)).length === 0);
  };

  const visibleErrors = {
    name: touched.name ? (errors.name ?? '') : '',
    type: touched.type ? (errors.type ?? '') : '',
    quantity: touched.quantity ? (errors.quantity ?? '') : '',
    categoryId: touched.categoryId ? (errors.categoryId ?? '') : '',
    storageId: touched.storageId ? (errors.storageId ?? '') : '',
  };

  const handleNewImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])].filter((file) =>
      ACCEPTED_IMAGE_TYPES.has(file.type),
    );

    updateState({
      ...formState,
      newImages: [...formState.newImages, ...files],
    });

    event.target.value = '';
  };

  const removeExistingImage = (index: number) => {
    updateState({
      ...formState,
      existingImages: formState.existingImages.filter((_, i) => i !== index),
    });
  };

  const removeNewImage = (index: number) => {
    updateState({
      ...formState,
      newImages: formState.newImages.filter((_, i) => i !== index),
    });
  };

  return (
    <form className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t('reports.form.skuLabel')}>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
            value={formState.sku}
            onChange={(event) =>
              updateState({ ...formState, sku: event.target.value })
            }
            type="text"
            placeholder={t('reports.form.skuPlaceholder')}
          />
        </FormField>

        <FormField
          label={t('reports.form.nameLabel')}
          error={visibleErrors.name}
          required
        >
          <input
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
              visibleErrors.name.length > 0
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-200'
            }`}
            value={formState.name}
            onChange={(event) =>
              updateState({ ...formState, name: event.target.value })
            }
            onBlur={() => setTouched((current) => ({ ...current, name: true }))}
            type="text"
            placeholder={t('reports.form.namePlaceholder')}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          label={t('reports.form.typeLabel')}
          error={visibleErrors.type}
          required
        >
          <select
            value={
              formState.type === 'equipment' || formState.type === 'consumable'
                ? formState.type
                : ''
            }
            onChange={(event) => {
              const nextType =
                event.target.value === 'equipment' ||
                event.target.value === 'consumable'
                  ? event.target.value
                  : '';

              updateState({
                ...formState,
                type: nextType,
              });
            }}
            onBlur={() => setTouched((current) => ({ ...current, type: true }))}
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
              visibleErrors.type.length > 0
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-200'
            }`}
          >
            <option value="">{t('reports.form.typePlaceholder')}</option>
            <option value="equipment">{t('reports.form.typeEquipment')}</option>
            <option value="consumable">
              {t('reports.form.typeConsumable')}
            </option>
          </select>
        </FormField>

        <FormField
          label={t('reports.form.quantityLabel')}
          error={visibleErrors.quantity}
          required
        >
          <input
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
              visibleErrors.quantity.length > 0
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-200'
            }`}
            value={formState.quantity}
            onChange={(event) =>
              updateState({ ...formState, quantity: event.target.value })
            }
            onBlur={() =>
              setTouched((current) => ({ ...current, quantity: true }))
            }
            type="number"
            min={1}
            step={1}
            placeholder={t('reports.form.quantityPlaceholder')}
          />
        </FormField>

        <FormField label={t('reports.form.expirationDateLabel')}>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
            value={formState.expirationDate}
            onChange={(event) =>
              updateState({ ...formState, expirationDate: event.target.value })
            }
            type="date"
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label={t('reports.form.categoryLabel')}
          error={visibleErrors.categoryId}
          required
        >
          <select
            value={formState.categoryId}
            onChange={(event) =>
              updateState({ ...formState, categoryId: event.target.value })
            }
            onBlur={() =>
              setTouched((current) => ({ ...current, categoryId: true }))
            }
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
              visibleErrors.categoryId.length > 0
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-200'
            }`}
          >
            <option value="">{t('reports.form.categoryPlaceholder')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label={t('reports.form.storageLabel')}
          error={visibleErrors.storageId}
          required
        >
          <select
            value={formState.storageId}
            onChange={(event) =>
              updateState({ ...formState, storageId: event.target.value })
            }
            onBlur={() =>
              setTouched((current) => ({ ...current, storageId: true }))
            }
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
              visibleErrors.storageId.length > 0
                ? 'border-rose-300 bg-rose-50/40'
                : 'border-slate-200'
            }`}
          >
            <option value="">{t('reports.form.storagePlaceholder')}</option>
            {storages.map((storage) => (
              <option key={storage.id} value={storage.id}>
                {storage.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label={t('reports.form.imagesLabel')}>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleNewImages}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-700"
        />
        <p className="mt-1 text-xs text-slate-400">
          {t('reports.form.imagesHint')}
        </p>

        {formState.existingImages.length + formState.newImages.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {formState.existingImages.map((url, index) => (
              <li
                key={`${url}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate pr-3 text-sky-600 hover:text-sky-700"
                >
                  {url}
                </a>
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="font-semibold text-rose-500 hover:text-rose-600"
                >
                  {t('reports.form.removeImage')}
                </button>
              </li>
            ))}

            {formState.newImages.map((file, index) => (
              <li
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
              >
                <span className="truncate pr-3">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="font-semibold text-rose-500 hover:text-rose-600"
                >
                  {t('reports.form.removeImage')}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </FormField>
    </form>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-600">
        {label}
        {required === true ? (
          <span className="ml-1 text-rose-500">*</span>
        ) : null}
      </label>
      {children}
      {(error ?? '').length > 0 ? (
        <p className="text-xs text-rose-500">{error}</p>
      ) : null}
    </div>
  );
}

function validateForm(
  state: InventoryReportFormState,
  t: (key: string) => string,
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
