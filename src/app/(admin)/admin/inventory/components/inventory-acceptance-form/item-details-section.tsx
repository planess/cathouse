import { useTranslations } from 'next-intl';

import { RadioGroup } from '@app/components/radio-group';

import { FormField } from '../common/form-field';
import { inputClassName } from '../common/input-class-name';

import { CategoryTreeSelect } from './category-tree-select';
import { ITEM_TYPE_OPTIONS } from './constants';

import type {
  MarkAcceptanceTouched,
  UpdateAcceptanceState,
  VisibleAcceptanceError,
} from './types';
import type {
  InventoryAcceptanceFormState,
  InventoryCategoryNode,
} from '../../types/inventory.types';

type ItemDetailsSectionProps = {
  formState: InventoryAcceptanceFormState;
  categoryTree: InventoryCategoryNode[];
  updateState: UpdateAcceptanceState;
  markTouched: MarkAcceptanceTouched;
  visibleError: VisibleAcceptanceError;
};

export function ItemDetailsSection({
  formState,
  categoryTree,
  updateState,
  markTouched,
  visibleError,
}: ItemDetailsSectionProps) {
  const t = useTranslations('adminInventory');
  const isConsumable = formState.itemType === 'consumable';

  return (
    <>
      <FormField label="Item type" required>
        <RadioGroup
          options={ITEM_TYPE_OPTIONS}
          value={formState.itemType}
          onChange={(value) => {
            if (value !== 'consumable' && value !== 'asset') {
              return;
            }

            updateState({
              ...formState,
              itemType: value,
              quantity: value === 'asset' ? '1' : formState.quantity,
              remainingQuantity:
                value === 'asset' ? '1' : formState.remainingQuantity,
            });
          }}
          direction="horizontal"
          className="w-full"
        />
      </FormField>

      <FormField
        label={t('reports.form.nameLabel')}
        required
        error={visibleError('name')}
      >
        <input
          type="text"
          value={formState.name}
          onChange={(event) =>
            updateState({ ...formState, name: event.target.value })
          }
          onBlur={() => markTouched('name')}
          placeholder={t('reports.form.namePlaceholder')}
          className={inputClassName(visibleError('name'))}
        />
      </FormField>

      <FormField
        label={t('reports.form.categoryLabel')}
        required
        error={visibleError('categoryId')}
      >
        <CategoryTreeSelect
          categories={categoryTree}
          value={formState.categoryId}
          onChange={(categoryId) => updateState({ ...formState, categoryId })}
          onBlur={() => markTouched('categoryId')}
        />
      </FormField>

      {isConsumable ? (
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            label="Batch number"
            required
            error={visibleError('batchNumber')}
          >
            <input
              type="text"
              value={formState.batchNumber}
              onChange={(event) =>
                updateState({ ...formState, batchNumber: event.target.value })
              }
              onBlur={() => markTouched('batchNumber')}
              className={inputClassName(visibleError('batchNumber'))}
              placeholder="BATCH-001"
            />
          </FormField>

          <FormField label="Expiry date">
            <input
              type="date"
              value={formState.expiryDate}
              onChange={(event) =>
                updateState({ ...formState, expiryDate: event.target.value })
              }
              className={inputClassName()}
            />
          </FormField>

          <FormField label="Unit" required error={visibleError('unit')}>
            <input
              type="text"
              value={formState.unit}
              onChange={(event) =>
                updateState({ ...formState, unit: event.target.value })
              }
              onBlur={() => markTouched('unit')}
              className={inputClassName(visibleError('unit'))}
              placeholder="e.g., pcs, boxes, kg"
            />
          </FormField>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Serial number"
            required
            error={visibleError('serialNumber')}
          >
            <input
              type="text"
              value={formState.serialNumber}
              onChange={(event) =>
                updateState({ ...formState, serialNumber: event.target.value })
              }
              onBlur={() => markTouched('serialNumber')}
              className={inputClassName(visibleError('serialNumber'))}
              placeholder="SN-001"
            />
          </FormField>

          <FormField
            label="Individual ID"
            required
            error={visibleError('individualId')}
          >
            <input
              type="text"
              value={formState.individualId}
              onChange={(event) =>
                updateState({ ...formState, individualId: event.target.value })
              }
              onBlur={() => markTouched('individualId')}
              className={inputClassName(visibleError('individualId'))}
              placeholder="INV-0001"
            />
          </FormField>
        </div>
      )}
    </>
  );
}
