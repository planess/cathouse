'use client';

import { useTranslations } from 'next-intl';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';

import type { SerializedObservation } from '@app/api/registry/[animalId]/observations/route';
import { useModal } from '@app/hooks/use-modal';

import {
  CreateInformatorForm,
  type CreateInformatorFormHandle,
} from './create-informator-form';
import { HealthSlider } from './health-slider';
import { PlusIcon } from './icons';
import { LocationField, type LocationValue } from './location-field';

import type { InformatorOption } from '../types';

export type ObservationFormHandle = {
  submit: () => Promise<SerializedObservation>;
};

type ObservationFormProps = {
  animalId: string;
  canReadRegistryMap: boolean;
  informatorOptions: InformatorOption[];
};

const ACCEPTED_MIME = 'image/png,image/jpeg';
const MAX_SIZE = 5.5 * 1024 * 1024;

export const ObservationForm = forwardRef<
  ObservationFormHandle,
  ObservationFormProps
>(({ animalId, canReadRegistryMap, informatorOptions }, ref) => {
  const t = useTranslations('historypage.personal');
  const modal = useModal();
  const [note, setNote] = useState('');
  const [informator, setInformator] = useState('');
  const [health, setHealth] = useState(5);
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [informatorOptionsState, setInformatorOptionsState] =
    useState(informatorOptions);
  const informatorFormRef = useRef<CreateInformatorFormHandle | null>(null);
  const collator = useMemo(
    () =>
      new Intl.Collator(undefined, { sensitivity: 'accent', numeric: true }),
    [],
  );

  useEffect(() => {
    setInformatorOptionsState(informatorOptions);
  }, [informatorOptions]);

  const attachmentsSize = useMemo(
    () => files.reduce((total, file) => total + file.size, 0),
    [files],
  );

  const handleFilesChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const selected = [...(event.target.files ?? [])];

      const oversizedFiles = selected.filter((file) => file.size > MAX_SIZE);

      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles.map((f) => f.name).join(', ');
        setError(`Some files exceed the 5.5MB limit: ${fileNames}`);
        event.target.value = ''; // Reset the input so they can retry
        return;
      }

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
      const response = await fetch(`/api/registry/${animalId}/observations`, {
        method: 'POST',
        body: payload,
      });

      const result = (await response.json()) as {
        success: boolean;
        observation?: SerializedObservation;
        message?: string;
      };

      if (!result.success) {
        setError(result.message ?? 'Unknown error');
        throw new Error(result.message ?? 'Unknown error');
      }

      if (!result.observation) {
        throw new Error('No observation returned');
      }

      return result.observation;
    } finally {
      setIsSubmitting(false);
    }
  }, [animalId, files, health, informator, location, note, t]);

  const handleCreateInformator = useCallback(async () => {
    informatorFormRef.current = null;
    const result = await modal.showModal<InformatorOption>({
      title: t('form.informator_modal.title'),
      description: t('form.informator_modal.description'),
      content: () => <CreateInformatorForm ref={informatorFormRef} />,
      dismissible: false,
      size: 'sm',
      actions: [
        { label: t('form.cancel'), value: void 0 },
        {
          label: t('form.submit'),
          tone: 'primary',
          onSelect: () => {
            if (!informatorFormRef.current) {
              throw new Error('Informator form is not ready yet.');
            }

            return informatorFormRef.current.submit();
          },
        },
      ],
    });

    if (result) {
      setInformatorOptionsState((previous) => {
        if (previous.some((option) => option.value === result.value)) {
          return previous;
        }

        return [...previous, result].sort((a, b) =>
          collator.compare(a.label, b.label),
        );
      });
      setInformator(result.value);
    }
  }, [collator, modal, t]);

  useImperativeHandle(ref, () => ({ submit }), [submit]);

  const hasInformatorOptions = informatorOptionsState.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-900 dark:text-slate-200 transition-colors"
          htmlFor="observation-note"
        >
          {t('form.note_label')}
        </label>
        <textarea
          id="observation-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder={t('form.note_placeholder')}
          className="w-full resize-none rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 dark:bg-stone-700 dark:text-stone-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label
              className="text-sm font-medium text-slate-900 dark:text-slate-200 transition-colors"
              htmlFor="observation-informator"
            >
              {t('form.informator_label')}
            </label>

            <button
              type="button"
              onClick={() => {
                void handleCreateInformator();
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900 dark:bg-neutral-400 "
              aria-label={t('form.informator_add_label')}
              title={t('form.informator_add_label')}
            >
              <PlusIcon />
            </button>
          </div>
          <select
            id="observation-informator"
            value={informator}
            onChange={(event) => setInformator(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 dark:bg-stone-700 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60 transition-colors"
            disabled={!hasInformatorOptions}
          >
            <option value="">
              {hasInformatorOptions
                ? t('form.informator_placeholder')
                : t('form.informator_empty')}
            </option>
            {informatorOptionsState.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
            {t('form.informator_hint')}
          </p>
          {!hasInformatorOptions && (
            <p className="text-xs text-amber-600">
              {t('form.informator_empty')}
            </p>
          )}
        </div>

        <HealthSlider
          value={health}
          onChange={setHealth}
          label={t('form.health_label')}
          description={t('form.health_description')}
        />
      </div>

      {canReadRegistryMap && (
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
      )}

      <div className="space-y-3">
        <div>
          <label
            className="text-sm font-medium text-slate-900 dark:text-slate-200 transition-colors"
            htmlFor="observation-assets"
          >
            {t('form.assets_label')}
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
            {t('form.assets_hint')}
          </p>
        </div>

        <input
          id="observation-assets"
          type="file"
          accept={ACCEPTED_MIME}
          multiple
          onChange={handleFilesChange}
          className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-600 transition-colors hover:border-slate-900 dark:text-slate-300"
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
            {t('form.assets_total', {
              count: files.length,
              size: formatBytes(attachmentsSize),
            })}
          </p>
        )}

        <p className="text-xs text-slate-500 py-3">{t('use_current_date')}</p>
      </div>

      {(error ?? '').length > 0 && (
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
});

ObservationForm.displayName = 'ObservationForm';
