import { useTranslations } from 'next-intl';

import { FormField } from '../common/form-field';
import { inputClassName } from '../common/input-class-name';

import type { UpdateReportState, VisibleReportErrors } from './types';
import type { InventoryReportFormState } from '../../types/inventory.types';

type IdentitySectionProps = {
  formState: InventoryReportFormState;
  visibleErrors: VisibleReportErrors;
  updateState: UpdateReportState;
  onNameBlur: () => void;
};

export function IdentitySection({
  formState,
  visibleErrors,
  updateState,
  onNameBlur,
}: IdentitySectionProps) {
  const t = useTranslations('adminInventory');

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label={t('reports.form.skuLabel')}>
        <input
          className={inputClassName()}
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
          className={inputClassName(visibleErrors.name)}
          value={formState.name}
          onChange={(event) =>
            updateState({ ...formState, name: event.target.value })
          }
          onBlur={onNameBlur}
          type="text"
          placeholder={t('reports.form.namePlaceholder')}
        />
      </FormField>
    </div>
  );
}
