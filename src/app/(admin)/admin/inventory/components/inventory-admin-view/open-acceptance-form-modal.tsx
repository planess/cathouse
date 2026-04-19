import { createInventoryAcceptance } from '@app/actions/inventory.server';
import type { useModal } from '@app/hooks/use-modal';

import { InventoryAcceptanceForm } from '../inventory-acceptance-form';

import { createAcceptanceInitialState } from './acceptance-initial-state';
import { buildAcceptanceFormData } from './build-acceptance-form-data';

import type {
  InventoryCategoryNode,
  InventorySourceOption,
  InventoryStorageRow,
} from '../../types/inventory.types';

type OpenAcceptanceFormModalParams = {
  showModal: ReturnType<typeof useModal>['showModal'];
  storages: InventoryStorageRow[];
  categories: InventoryCategoryNode[];
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

export function openAcceptanceFormModal({
  showModal,
  storages,
  categories,
  peopleOptions,
  clinicOptions,
  volunteerOptions,
  labels,
  onRefresh,
}: OpenAcceptanceFormModalParams) {
  const initialState = createAcceptanceInitialState();

  const formStateRef = { current: initialState };
  const formValidityRef = { current: false };

  const modalHandle = showModal({
    title: labels.title,
    content: (
      <InventoryAcceptanceForm
        initialState={initialState}
        storages={storages}
        categoryTree={categories}
        peopleOptions={peopleOptions}
        clinicOptions={clinicOptions}
        volunteerOptions={volunteerOptions}
        onChange={(nextState) => {
          formStateRef.current = nextState;
        }}
        onValidityChange={(isValid) => {
          formValidityRef.current = isValid;
          modalHandle.setActionEnabled('inventory-accept-submit', isValid);
        }}
      />
    ),
    actions: [
      { label: labels.cancel, tone: 'ghost' },
      {
        id: 'inventory-accept-submit',
        label: labels.create,
        tone: 'primary',
        disabled: !formValidityRef.current,
        onSelect: async () => {
          if (!formValidityRef.current) {
            return;
          }

          const result = await createInventoryAcceptance(
            buildAcceptanceFormData(formStateRef.current),
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
}
