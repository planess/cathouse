import { useTranslations } from 'next-intl';

import { RadioGroup } from '@app/components/radio-group';

import { FormField } from '../common/form-field';
import { inputClassName } from '../common/input-class-name';

import { CONDITION_OPTIONS } from './constants';

import type {
  MarkAcceptanceTouched,
  UpdateAcceptanceState,
  VisibleAcceptanceError,
} from './types';
import type {
  InventoryAcceptanceFormState,
  InventoryStorageRow,
} from '../../types/inventory.types';

type TransactionDetailsSectionProps = {
  formState: InventoryAcceptanceFormState;
  storages: InventoryStorageRow[];
  updateState: UpdateAcceptanceState;
  markTouched: MarkAcceptanceTouched;
  visibleError: VisibleAcceptanceError;
};

export function TransactionDetailsSection({
  formState,
  storages,
  updateState,
  markTouched,
  visibleError,
}: TransactionDetailsSectionProps) {
  const t = useTranslations('adminInventory');
  const isConsumable = formState.itemType === 'consumable';

  return (
    <>
      <FormField
        label={t('reports.form.storageLabel')}
        required
        error={visibleError('toStorageId')}
      >
        <select
          value={formState.toStorageId}
          onChange={(event) =>
            updateState({ ...formState, toStorageId: event.target.value })
          }
          onBlur={() => markTouched('toStorageId')}
          className={inputClassName(visibleError('toStorageId'))}
        >
          <option value="">{t('reports.form.storagePlaceholder')}</option>
          {storages.map((storage) => (
            <option key={storage.id} value={storage.id}>
              {storage.name}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label={t('reports.form.quantityLabel')}
          required
          error={visibleError('quantity')}
        >
          <input
            type="number"
            min={1}
            step={1}
            value={formState.quantity}
            disabled={!isConsumable}
            onChange={(event) =>
              updateState({ ...formState, quantity: event.target.value })
            }
            onBlur={() => markTouched('quantity')}
            className={inputClassName(visibleError('quantity'))}
          />
        </FormField>

        <FormField
          label="Remaining quantity"
          required
          error={visibleError('remainingQuantity')}
        >
          <input
            type="number"
            min={1}
            step={1}
            value={formState.remainingQuantity}
            disabled={!isConsumable}
            onChange={(event) =>
              updateState({ ...formState, remainingQuantity: event.target.value })
            }
            onBlur={() => markTouched('remainingQuantity')}
            className={inputClassName(visibleError('remainingQuantity'))}
          />
        </FormField>
      </div>

      <FormField
        label="Transaction date and time"
        required
        error={visibleError('transactionDate')}
      >
        <input
          type="datetime-local"
          value={formState.transactionDate}
          onChange={(event) =>
            updateState({ ...formState, transactionDate: event.target.value })
          }
          onBlur={() => markTouched('transactionDate')}
          className={inputClassName(visibleError('transactionDate'))}
        />
      </FormField>

      <FormField label="Condition" required>
        <RadioGroup
          options={CONDITION_OPTIONS}
          value={formState.condition}
          onChange={(value) => {
            if (
              value !== 'new' &&
              value !== 'good' &&
              value !== 'fair' &&
              value !== 'poor' &&
              value !== 'broken'
            ) {
              return;
            }

            updateState({ ...formState, condition: value });
          }}
          direction="horizontal"
          className="w-full"
        />
      </FormField>

      <FormField label="Damage description">
        <textarea
          value={formState.damageDescription}
          onChange={(event) =>
            updateState({ ...formState, damageDescription: event.target.value })
          }
          rows={3}
          className={inputClassName()}
          placeholder="Optional details about damages"
        />
      </FormField>

      <FormField label="Notes">
        <textarea
          value={formState.notes}
          onChange={(event) =>
            updateState({ ...formState, notes: event.target.value })
          }
          rows={3}
          className={inputClassName()}
          placeholder="Optional notes"
        />
      </FormField>

      <FormField
        label="Estimated cost"
        required
        error={visibleError('estimatedCost')}
      >
        <input
          type="number"
          min={0}
          step="0.01"
          value={formState.estimatedCost}
          onChange={(event) =>
            updateState({ ...formState, estimatedCost: event.target.value })
          }
          onBlur={() => markTouched('estimatedCost')}
          className={inputClassName(visibleError('estimatedCost'))}
          placeholder="0.00"
        />
      </FormField>
    </>
  );
}
