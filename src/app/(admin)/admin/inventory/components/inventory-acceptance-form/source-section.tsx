import { RadioGroup } from '@app/components/radio-group';

import { FormField } from '../common/form-field';
import { inputClassName } from '../common/input-class-name';

import { FROM_TYPE_OPTIONS, TRANSACTION_TYPE_OPTIONS } from './constants';

import type {
  MarkAcceptanceTouched,
  UpdateAcceptanceState,
  VisibleAcceptanceError,
} from './types';
import type {
  InventoryAcceptanceFormState,
  InventorySourceOption,
} from '../../types/inventory.types';

type SourceSectionProps = {
  formState: InventoryAcceptanceFormState;
  peopleOptions: InventorySourceOption[];
  clinicOptions: InventorySourceOption[];
  volunteerOptions: InventorySourceOption[];
  updateState: UpdateAcceptanceState;
  markTouched: MarkAcceptanceTouched;
  visibleError: VisibleAcceptanceError;
};

export function SourceSection({
  formState,
  peopleOptions,
  clinicOptions,
  volunteerOptions,
  updateState,
  markTouched,
  visibleError,
}: SourceSectionProps) {
  const currentFromOptions =
    formState.fromType === 'people'
      ? peopleOptions
      : formState.fromType === 'clinic'
        ? clinicOptions
        : formState.fromType === 'volunteer'
          ? volunteerOptions
          : [];

  const isFromIdType =
    formState.fromType === 'people' ||
    formState.fromType === 'clinic' ||
    formState.fromType === 'volunteer';
  const isFromNameType =
    formState.fromType === 'shop' || formState.fromType === 'organization';

  return (
    <>
      <FormField label="Transaction type" required>
        <RadioGroup
          options={TRANSACTION_TYPE_OPTIONS}
          value={formState.transactionType}
          onChange={(value) => {
            if (
              value !== 'donation' &&
              value !== 'purchase' &&
              value !== 'transfer'
            ) {
              return;
            }

            updateState({ ...formState, transactionType: value });
          }}
          direction="horizontal"
          className="w-full"
        />
      </FormField>

      <FormField label="Source type" required>
        <RadioGroup
          options={FROM_TYPE_OPTIONS}
          value={formState.fromType}
          onChange={(value) => {
            if (
              value !== 'people' &&
              value !== 'clinic' &&
              value !== 'shop' &&
              value !== 'organization' &&
              value !== 'volunteer'
            ) {
              return;
            }

            updateState({
              ...formState,
              fromType: value,
              fromId: '',
              fromName: '',
            });
          }}
          direction="horizontal"
          className="w-full"
        />
      </FormField>

      {isFromIdType ? (
        <FormField label="Source" required error={visibleError('fromId')}>
          <select
            value={formState.fromId}
            onChange={(event) =>
              updateState({ ...formState, fromId: event.target.value })
            }
            onBlur={() => markTouched('fromId')}
            className={inputClassName(visibleError('fromId'))}
          >
            <option value="">Select source</option>
            {currentFromOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

      {isFromNameType ? (
        <FormField label="Source name" required error={visibleError('fromName')}>
          <input
            type="text"
            value={formState.fromName}
            onChange={(event) =>
              updateState({ ...formState, fromName: event.target.value })
            }
            onBlur={() => markTouched('fromName')}
            className={inputClassName(visibleError('fromName'))}
            placeholder="Source name"
          />
        </FormField>
      ) : null}
    </>
  );
}
