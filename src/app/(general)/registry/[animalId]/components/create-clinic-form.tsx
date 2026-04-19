'use client';

import { useTranslations } from 'next-intl';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import { createClinic } from '../server/create-clinic';

import { LocationField, type LocationValue } from './location-field';

import type { ClinicOption } from '../types';

export type CreateClinicFormHandle = {
  submit: () => Promise<ClinicOption>;
};

export const CreateClinicForm = forwardRef<CreateClinicFormHandle>(
  (_props, ref) => {
    const t = useTranslations('historypage.personal');
    const [name, setName] = useState('');
    const [location, setLocation] = useState<LocationValue | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = useCallback(async () => {
      setError(null);

      if (!name.trim()) {
        const message = t('form.clinic_modal.name_error');
        setError(message);
        throw new Error(message);
      }

      if (!location) {
        const message = t('form.clinic_modal.location_required');
        setError(message);
        throw new Error(message);
      }

      if (!location.address.trim()) {
        const message = t('form.clinic_modal.address_error');
        setError(message);
        throw new Error(message);
      }

      const payload = new FormData();
      payload.append('name', name.trim());
      payload.append('address', location.address.trim());
      payload.append('latitude', location.latitude.toString());
      payload.append('longitude', location.longitude.toString());

      setIsSubmitting(true);

      try {
        const response = await createClinic(payload);

        if (!response.success) {
          setError(response.message);
          throw new Error(response.message);
        }

        return response.clinic;
      } finally {
        setIsSubmitting(false);
      }
    }, [location, name, t]);

    useImperativeHandle(ref, () => ({ submit }), [submit]);

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-900 dark:text-slate-300 transition-colors"
            htmlFor="clinic-name"
          >
            {t('form.clinic_modal.name_label')}
          </label>
          <input
            id="clinic-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('form.clinic_modal.name_placeholder')}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60 dark:bg-stone-700 dark:text-stone-50 transition-colors"
            disabled={isSubmitting}
          />
          <p className="text-xs text-slate-500">
            {t('form.clinic_modal.name_hint')}
          </p>
        </div>

        <LocationField
          value={location}
          onChange={setLocation}
          label={t('form.clinic_modal.location_label')}
          description={t('form.clinic_modal.location_description')}
          detectLabel={t('form.clinic_modal.location_detect')}
          detectingLabel={t('form.clinic_modal.location_detecting')}
          detectedLabel={t('form.clinic_modal.location_detected')}
          detectErrorLabel={t('form.clinic_modal.location_detect_error')}
          unsupportedLabel={t('form.clinic_modal.location_unsupported')}
          addressLabel={t('form.clinic_modal.address_label')}
          addressPlaceholder={t('form.clinic_modal.address_placeholder')}
          coordinatesLabel={t('form.clinic_modal.coordinates_label')}
          clearLabel={t('form.clinic_modal.location_clear')}
          idleLabel={t('form.clinic_modal.location_status_idle')}
        />

        {error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {isSubmitting && (
          <p className="text-sm font-medium text-slate-600" aria-live="polite">
            {t('form.clinic_modal.saving')}
          </p>
        )}
      </div>
    );
  },
);

CreateClinicForm.displayName = 'CreateClinicForm';
