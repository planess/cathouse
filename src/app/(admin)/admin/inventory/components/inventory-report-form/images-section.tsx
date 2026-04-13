
import { useTranslations } from 'next-intl';

import { FormField } from '../common/form-field';

import type { UpdateReportState } from './types';
import type { InventoryReportFormState } from '../../types/inventory.types';
import type { ChangeEvent } from 'react';

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type ImagesSectionProps = {
  formState: InventoryReportFormState;
  updateState: UpdateReportState;
};

export function ImagesSection({ formState, updateState }: ImagesSectionProps) {
  const t = useTranslations('adminInventory');

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
    <FormField label={t('reports.form.imagesLabel')}>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleNewImages}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-700"
      />
      <p className="mt-1 text-xs text-slate-400">{t('reports.form.imagesHint')}</p>

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
  );
}
