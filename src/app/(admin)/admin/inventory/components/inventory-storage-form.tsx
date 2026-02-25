'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { MapPicker } from '@app/components/map/map-picker';

import type { StorageFormProps } from '../types/inventory-component-props.types';
import type { StorageFormState } from '../types/inventory.types';

export function StorageForm({
  initialState,
  onChange,
  onValidityChange,
}: StorageFormProps) {
  const t = useTranslations('adminInventory');
  const [formState, setFormState] = useState<StorageFormState>(initialState);
  const [touched, setTouched] = useState({ name: false, location: false });

  const errors = validateStorageForm(formState, t);
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  const updateState = (nextState: StorageFormState) => {
    setFormState(nextState);
    onChange(nextState);
    onValidityChange(
      Object.keys(validateStorageForm(nextState, t)).length === 0,
    );
  };

  const nameError = touched.name ? (errors.name ?? '') : '';
  const locationError = touched.location ? (errors.location ?? '') : '';

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600">
          {t('storages.form.nameLabel')}
        </label>
        <input
          className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 ${
            nameError.length > 0
              ? 'border-rose-300 bg-rose-50/40'
              : 'border-slate-200'
          }`}
          value={formState.name}
          onChange={(event) =>
            updateState({ ...formState, name: event.target.value })
          }
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          type="text"
          placeholder={t('storages.form.namePlaceholder')}
        />
        {nameError.length > 0 ? (
          <p className="text-xs text-rose-500">{nameError}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-600">
            {t('storages.form.locationLabel')}
          </label>
          <button
            type="button"
            onClick={() =>
              updateState({ ...formState, latitude: null, longitude: null })
            }
            className="text-xs font-semibold text-slate-400 transition hover:text-rose-500"
          >
            {t('storages.form.clearLocation')}
          </button>
        </div>
        <MapPicker
          value={{
            latitude: formState.latitude,
            longitude: formState.longitude,
          }}
          ariaLabel={t('storages.form.mapAria')}
          hint={t('storages.form.mapHint')}
          onChange={(coords) => {
            setTouched((current) => ({ ...current, location: true }));
            updateState({
              ...formState,
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
          }}
        />
        {locationError.length > 0 ? (
          <p className="text-xs text-rose-500">{locationError}</p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t('storages.form.latitudeLabel')}
          </p>
          <p className="text-sm font-mono text-slate-600">
            {formatCoordinate(formState.latitude)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {t('storages.form.longitudeLabel')}
          </p>
          <p className="text-sm font-mono text-slate-600">
            {formatCoordinate(formState.longitude)}
          </p>
        </div>
      </div>
    </form>
  );
}

function formatCoordinate(value: number | null) {
  if (value === null) {
    return '--';
  }

  return value.toFixed(5);
}

function validateStorageForm(
  state: StorageFormState,
  t: (key: string) => string,
) {
  const errors: { name?: string; location?: string } = {};
  const name = state.name.trim();

  if (!name) {
    errors.name = t('storages.form.nameRequired');
  }

  if (state.latitude === null || state.longitude === null) {
    errors.location = t('storages.form.locationRequired');
  }

  return errors;
}
