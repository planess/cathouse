'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';
import { useTranslations } from 'next-intl';

import {
  createObservation,
  type SerializedObservation,
} from '../server/create-observation';
import { HealthSlider } from './health-slider';
import { LocationField, type LocationValue } from './location-field';
import type { InformatorOption } from '../types';

export type ObservationFormHandle = {
  submit: () => Promise<SerializedObservation>;
};

type ObservationFormProps = {
  animalId: string;
  informatorOptions: InformatorOption[];
};

const ACCEPTED_MIME = 'image/png,image/jpeg';

export const ObservationForm = forwardRef<ObservationFormHandle, ObservationFormProps>(
  ({ animalId, informatorOptions }, ref) => {
    const t = useTranslations('historypage.personal');
    const [note, setNote] = useState('');
    const [informator, setInformator] = useState('');
    const [health, setHealth] = useState(5);
    const [location, setLocation] = useState<LocationValue | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const attachmentsSize = useMemo(
      () => files.reduce((total, file) => total + file.size, 0),
      [files],
    );

    const handleFilesChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.target.files ?? []);
        setFiles(selected);
      },
      [],
    );

    const handleRemoveFile = useCallback((index: number) => {
      setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
    }, []);

    const formatBytes = useCallback((size: number) => {
      if (size < 1024) {
        return `${size} B`;
      }

      if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
      }

      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }, []);

    const submit = useCallback(async () => {
      setError(null);

      if (!note.trim() && files.length === 0 && !location) {
        const message = t('form.errors_primary');
        setError(message);
        throw new Error(message);
      }

      if (location && !location.address.trim()) {
        const message = t('form.location_address_required');
        setError(message);
        throw new Error(message);
      }

      const payload = new FormData();
      payload.append('animalId', animalId);

      if (note.trim()) {
        payload.append('note', note.trim());
      }

      if (informator.trim()) {
        payload.append('informator', informator.trim());
      }

      payload.append('health', String(health));

      if (location) {
        payload.append('locationAddress', location.address.trim());
        payload.append('locationLatitude', location.latitude.toString());
        payload.append('locationLongitude', location.longitude.toString());
      }

      files.forEach((file) => payload.append('assets', file, file.name));

      setIsSubmitting(true);

      try {
        const response = await createObservation(payload);

        if (!response.success) {
          setError(response.message);
          throw new Error(response.message);
        }

        return response.observation;
      } finally {
        setIsSubmitting(false);
      }
    }, [animalId, files, health, informator, location, note, t]);

    useImperativeHandle(ref, () => ({ submit }), [submit]);

    const hasInformatorOptions = informatorOptions.length > 0;

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="observation-note">
            {t('form.note_label')}
          </label>
          <textarea
            id="observation-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder={t('form.note_placeholder')}
            className="w-full resize-none rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          <p className="text-xs text-slate-500">{t('use_current_date')}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="observation-informator">
              {t('form.informator_label')}
            </label>
            <select
              id="observation-informator"
              value={informator}
              onChange={(event) => setInformator(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
              disabled={!hasInformatorOptions}
            >
              <option value="">
                {hasInformatorOptions
                  ? t('form.informator_placeholder')
                  : t('form.informator_empty')}
              </option>
              {informatorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">{t('form.informator_hint')}</p>
            {!hasInformatorOptions && (
              <p className="text-xs text-amber-600">{t('form.informator_empty')}</p>
            )}
          </div>

          <HealthSlider
            value={health}
            onChange={setHealth}
            label={t('form.health_label')}
            description={t('form.health_description')}
          />
        </div>

        <LocationField
          value={location}
          onChange={setLocation}
          label={t('form.location_label')}
          description={t('form.location_description')}
          detectLabel={t('form.location_detect')}
          detectingLabel={t('form.location_detecting')}
          detectedLabel={t('form.location_detected')}
          detectErrorLabel={t('form.location_detect_error')}
          unsupportedLabel={t('form.location_unsupported')}
          addressLabel={t('form.location_address_label')}
          addressPlaceholder={t('form.location_address_placeholder')}
          coordinatesLabel={t('form.location_coordinates_label')}
          clearLabel={t('form.location_clear')}
          idleLabel={t('form.location_status_idle')}
        />

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-900" htmlFor="observation-assets">
              {t('form.assets_label')}
            </label>
            <p className="text-xs text-slate-500">{t('form.assets_hint')}</p>
          </div>

          <input
            id="observation-assets"
            type="file"
            accept={ACCEPTED_MIME}
            multiple
            onChange={handleFilesChange}
            className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600 transition hover:border-slate-900"
          />

          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div className="text-sm">
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatBytes(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-xs font-semibold text-rose-600 transition hover:text-rose-700"
                  >
                    {t('form.assets_remove')}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {files.length > 0 && (
            <p className="text-xs text-slate-500">
              {t('form.assets_total', { count: files.length, size: formatBytes(attachmentsSize) })}
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {isSubmitting && (
          <p className="text-sm font-medium text-slate-600" aria-live="polite">
            {t('form.saving')}
          </p>
        )}
      </div>
    );
  },
);

ObservationForm.displayName = 'ObservationForm';
