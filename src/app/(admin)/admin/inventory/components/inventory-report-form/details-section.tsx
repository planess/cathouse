import { useTranslations } from 'next-intl';

import { FormField } from '../common/form-field';
import { inputClassName } from '../common/input-class-name';

import type { UpdateReportState, VisibleReportErrors } from './types';
import type {
  InventoryCategoryOption,
  InventoryReportFormState,
  InventoryStorageRow,
} from '../../types/inventory.types';

type DetailsSectionProps = {
  formState: InventoryReportFormState;
  storages: InventoryStorageRow[];
  categories: InventoryCategoryOption[];
  visibleErrors: VisibleReportErrors;
  updateState: UpdateReportState;
  onTypeBlur: () => void;
  onQuantityBlur: () => void;
  onCategoryBlur: () => void;
  onStorageBlur: () => void;
};

export function DetailsSection({
  formState,
  storages,
  categories,
  visibleErrors,
  updateState,
  onTypeBlur,
  onQuantityBlur,
  onCategoryBlur,
  onStorageBlur,
}: DetailsSectionProps) {
  const t = useTranslations('adminInventory');

  return (
    <>
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
            onBlur={onTypeBlur}
            className={inputClassName(visibleErrors.type)}
          >
            <option value="">{t('reports.form.typePlaceholder')}</option>
            <option value="equipment">{t('reports.form.typeEquipment')}</option>
            <option value="consumable">{t('reports.form.typeConsumable')}</option>
          </select>
        </FormField>

        <FormField
          label={t('reports.form.quantityLabel')}
          error={visibleErrors.quantity}
          required
        >
          <input
            className={inputClassName(visibleErrors.quantity)}
            value={formState.quantity}
            onChange={(event) =>
              updateState({ ...formState, quantity: event.target.value })
            }
            onBlur={onQuantityBlur}
            type="number"
            min={1}
            step={1}
            placeholder={t('reports.form.quantityPlaceholder')}
          />
        </FormField>

        <FormField label={t('reports.form.expirationDateLabel')}>
          <input
            className={inputClassName()}
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
            onBlur={onCategoryBlur}
            className={inputClassName(visibleErrors.categoryId)}
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
            onBlur={onStorageBlur}
            className={inputClassName(visibleErrors.storageId)}
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
    </>
  );
}
