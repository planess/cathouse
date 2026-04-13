import { appendInventoryTransaction } from '@app/actions/inventory.server';
import type { useModal } from '@app/hooks/use-modal';

import { InventoryTransferForm } from '../inventory-transfer-form';

import { buildTransferFormData } from './build-transfer-form-data';
import { createTransferInitialState } from './create-transfer-initial-state';

import type {
  InventoryEntityRow,
  InventorySourceOption,
  InventoryStorageRow,
} from '../../types/inventory.types';

type OpenTransferFormModalParams = {
  showModal: ReturnType<typeof useModal>['showModal'];
  entity: InventoryEntityRow;
  storages: InventoryStorageRow[];
  peopleOptions: InventorySourceOption[];
  clinicOptions: InventorySourceOption[];
  volunteerOptions: InventorySourceOption[];
  labels: {
    title: string;
    cancel: string;
    create: string;
    submitErrorTitle: string;
    close: string;
  };
  onRefresh: () => void;
};

export function openTransferFormModal({
  showModal,
  entity,
  storages,
  peopleOptions,
  clinicOptions,
  volunteerOptions,
  labels,
  onRefresh,
}: OpenTransferFormModalParams) {
  const initialState = createTransferInitialState(entity);

  const formStateRef = { current: initialState };
  const formValidityRef = { current: false };

  const modalHandle = showModal({
    title: labels.title,
    content: (
      <InventoryTransferForm
        initialState={initialState}
        storages={storages}
        peopleOptions={peopleOptions}
        clinicOptions={clinicOptions}
        volunteerOptions={volunteerOptions}
        onChange={(nextState) => {
          formStateRef.current = nextState;
        }}
        onValidityChange={(isValid) => {
          formValidityRef.current = isValid;
          modalHandle.setActionEnabled('inventory-transfer-submit', isValid);
        }}
      />
    ),
    actions: [
      { label: labels.cancel, tone: 'ghost' },
      {
        id: 'inventory-transfer-submit',
        label: labels.create,
        tone: 'primary',
        disabled: !formValidityRef.current,
        onSelect: async () => {
          if (!formValidityRef.current) {
            return;
          }

          const result = await appendInventoryTransaction(
            buildTransferFormData(formStateRef.current),
          );

          if (!result.success) {
            void showModal({
              title: labels.submitErrorTitle,
              description: result.message,
              actions: [{ label: labels.close, tone: 'primary' }],
              size: 'sm',
            });

            return;
          }

          onRefresh();
        },
      },
    ],
    size: 'xl',
  });

  modalHandle.setActionEnabled('inventory-transfer-submit', false);
}
