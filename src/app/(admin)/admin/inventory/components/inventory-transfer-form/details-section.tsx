import { useTranslations } from 'next-intl';

import { RadioGroup } from '@app/components/radio-group';

import { FormField } from '../common/form-field';
import { inputClassName } from '../common/input-class-name';
import { MediaFilesField } from '../common/media-files-field';
import { DOCUMENT_AND_IMAGE_ACCEPT } from '../inventory-acceptance-form/constants';

import {
  TRANSFER_CONDITION_OPTIONS,
  TRANSFER_TO_TYPE_OPTIONS,
  TRANSFER_TRANSACTION_TYPE_OPTIONS,
} from './constants';

import type { UpdateTransferState, VisibleTransferErrors } from './types';
import type {
  InventorySourceOption,
  InventoryStorageRow,
  InventoryTransferFormState,
} from '../../types/inventory.types';

type TransferDetailsSectionProps = {
  formState: InventoryTransferFormState;
  storages: InventoryStorageRow[];
  peopleOptions: InventorySourceOption[];
  clinicOptions: InventorySourceOption[];
  volunteerOptions: InventorySourceOption[];
  visibleErrors: VisibleTransferErrors;
  updateState: UpdateTransferState;
  onToBlur: () => void;
  onQuantityBlur: () => void;
  onDateBlur: () => void;
  onEstimatedCostBlur: () => void;
};

function resolveDestinationOptions(
  toType: InventoryTransferFormState['toType'],
  storages: InventoryStorageRow[],
  peopleOptions: InventorySourceOption[],
  clinicOptions: InventorySourceOption[],
  volunteerOptions: InventorySourceOption[],
): InventorySourceOption[] {
  if (toType === 'storage') {
    return storages.map((storage) => ({ id: storage.id, name: storage.name }));
  }

  if (toType === 'people') {
    return peopleOptions;
  }

  if (toType === 'clinic') {
    return clinicOptions;
  }

  return volunteerOptions;
}

export function TransferDetailsSection({
  formState,
  storages,
  peopleOptions,
  clinicOptions,
  volunteerOptions,
  visibleErrors,
  updateState,
  onToBlur,
  onQuantityBlur,
  onDateBlur,
  onEstimatedCostBlur,
}: TransferDetailsSectionProps) {
  const t = useTranslations('adminInventory');
  const isDisposal = formState.transactionType === 'disposal';

  const destinationOptions = resolveDestinationOptions(
    formState.toType,
    storages,
    peopleOptions,
    clinicOptions,
    volunteerOptions,
  );

  const maxQuantity = Number(formState.previousRemainingQuantity);

  return (
    <div className="space-y-4">
      <FormField label={t('transfers.form.typeLabel')} required>
        <RadioGroup
          options={TRANSFER_TRANSACTION_TYPE_OPTIONS.map((option) => ({
            value: option.value,
            label: t(`transfers.form.types.${option.value}`),
          }))}
          value={formState.transactionType}
          onChange={(value) => {
            if (
              value !== 'transfer' &&
              value !== 'release' &&
              value !== 'disposal'
            ) {
              return;
            }

            updateState({
              ...formState,
              transactionType: value,
              ...(value === 'disposal' ? { toId: '' } : {}),
            });
          }}
          direction="horizontal"
          className="w-full"
        />
      </FormField>

      {!isDisposal && (
        <>
          <FormField label={t('transfers.form.toTypeLabel')} required>
            <RadioGroup
              options={TRANSFER_TO_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: t(`transfers.form.toTypes.${option.value}`),
              }))}
              value={formState.toType}
              onChange={(value) => {
                if (
                  value !== 'people' &&
                  value !== 'clinic' &&
                  value !== 'volunteer' &&
                  value !== 'storage'
                ) {
                  return;
                }

                updateState({
                  ...formState,
                  toType: value,
                  toId: '',
                });
              }}
              direction="horizontal"
              className="w-full"
            />
          </FormField>

          <FormField
            label={t('transfers.form.toLabel')}
            required
            error={visibleErrors.toId}
          >
            <select
              value={formState.toId}
              onChange={(event) =>
                updateState({ ...formState, toId: event.target.value })
              }
              onBlur={onToBlur}
              className={inputClassName(visibleErrors.toId)}
            >
              <option value="">{t('transfers.form.toPlaceholder')}</option>
              {destinationOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </FormField>
        </>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label={t('transfers.form.quantityLabel')}
          required
          error={visibleErrors.quantity}
        >
          <input
            type="number"
            max={Number.isFinite(maxQuantity) ? maxQuantity : 0}
            step={1}
            value={formState.quantity}
            onChange={(event) =>
              updateState({ ...formState, quantity: event.target.value })
            }
            onBlur={onQuantityBlur}
            className={inputClassName(visibleErrors.quantity)}
          />
        </FormField>

        <FormField
          label={t('transfers.form.dateLabel')}
          required
          error={visibleErrors.transactionDate}
        >
          <input
            type="datetime-local"
            value={formState.transactionDate}
            onChange={(event) =>
              updateState({ ...formState, transactionDate: event.target.value })
            }
            onBlur={onDateBlur}
            className={inputClassName(visibleErrors.transactionDate)}
          />
        </FormField>
      </div>

      <FormField label={t('transfers.form.conditionLabel')}>
        <select
          value={formState.condition}
          onChange={(event) => {
            const { value } = event.target;

            if (
              value !== 'good' &&
              value !== 'fair' &&
              value !== 'poor' &&
              value !== 'broken'
            ) {
              return;
            }

            updateState({ ...formState, condition: value });
          }}
          className={inputClassName()}
        >
          {TRANSFER_CONDITION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(`transfers.form.conditions.${option.value}`)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={t('transfers.form.damageDescriptionLabel')}>
        <textarea
          value={formState.damageDescription}
          onChange={(event) =>
            updateState({ ...formState, damageDescription: event.target.value })
          }
          rows={3}
          className={inputClassName()}
        />
      </FormField>

      <FormField label={t('transfers.form.notesLabel')}>
        <textarea
          value={formState.notes}
          onChange={(event) =>
            updateState({ ...formState, notes: event.target.value })
          }
          rows={3}
          className={inputClassName()}
        />
      </FormField>

      <FormField
        label={t('transfers.form.estimatedCostLabel')}
        required
        error={visibleErrors.estimatedCost}
      >
        <input
          type="number"
          min={0}
          step="0.01"
          value={formState.estimatedCost}
          onChange={(event) =>
            updateState({ ...formState, estimatedCost: event.target.value })
          }
          onBlur={onEstimatedCostBlur}
          className={inputClassName(visibleErrors.estimatedCost)}
        />
      </FormField>

      <MediaFilesField
        label={t('transfers.form.mediaLabel')}
        hint={t('transfers.form.mediaHint')}
        files={formState.mediaFiles}
        accept={DOCUMENT_AND_IMAGE_ACCEPT}
        inputClassName={inputClassName()}
        removeLabel={t('reports.form.removeImage')}
        onAddFiles={(files) => {
          const acceptedFiles = files.filter(
            (file) => file.size > 0 && !file.type.startsWith('video/'),
          );

          if (acceptedFiles.length === 0) {
            return;
          }

          updateState({
            ...formState,
            mediaFiles: [...formState.mediaFiles, ...acceptedFiles],
          });
        }}
        onRemoveFile={(index) => {
          updateState({
            ...formState,
            mediaFiles: formState.mediaFiles.filter((_, i) => i !== index),
          });
        }}
      />
    </div>
  );
}
