'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import {
  createStorage,
  deleteStorage,
  updateStorage,
} from '@app/actions/inventory.server';
import { useModal } from '@app/hooks/use-modal';

import { StorageForm } from './inventory-storage-form';
import { StoragesTable } from './inventory-storages-modal/storages-table';

import type {
  StorageFormModalOptions,
  StorageModalProps,
} from '../types/inventory-component-props.types';
import type { InventoryStorageRow } from '../types/inventory.types';

export function StoragesModal({ storages, onRefresh }: StorageModalProps) {
  const t = useTranslations('adminInventory');
  const { showModal } = useModal();

  const locationLabel = useMemo(
    () => (storage: InventoryStorageRow) => {
      if (storage.latitude === null || storage.longitude === null) {
        return t('storages.table.noLocation');
      }

      return `${storage.latitude.toFixed(4)}, ${storage.longitude.toFixed(4)}`;
    },
    [t],
  );

  const openStorageForm = (options: StorageFormModalOptions) => {
    const formStateRef = { current: options.initialState };
    const formValidityRef = { current: false };

    const modalHandle = showModal({
      title: options.title,
      content: (
        <StorageForm
          initialState={options.initialState}
          onChange={(nextState) => {
            formStateRef.current = nextState;
          }}
          onValidityChange={(isValid) => {
            formValidityRef.current = isValid;
            modalHandle.setActionEnabled('storage-submit', isValid);
          }}
        />
      ),
      actions: [
        { label: t('common.cancel'), tone: 'ghost' },
        {
          id: 'storage-submit',
          label: options.submitLabel,
          tone: 'primary',
          disabled: !formValidityRef.current,
          onSelect: async () => {
            if (!formValidityRef.current) {
              return;
            }
            await options.onSubmit(formStateRef.current);
            onRefresh();
          },
        },
      ],
      size: 'lg',
    });
  };

  const handleAddStorage = () => {
    openStorageForm({
      title: t('storages.addTitle'),
      submitLabel: t('common.create'),
      initialState: {
        name: '',
        latitude: null,
        longitude: null,
      },
      onSubmit: async (state) => {
        await createStorage(state);
      },
    });
  };

  const handleEditStorage = (storage: InventoryStorageRow) => {
    openStorageForm({
      title: t('storages.editTitle', { name: storage.name }),
      submitLabel: t('common.saveChanges'),
      initialState: {
        name: storage.name,
        latitude: storage.latitude,
        longitude: storage.longitude,
      },
      onSubmit: async (state) => {
        await updateStorage({ id: storage.id, ...state });
      },
    });
  };

  const handleDeleteStorage = (storage: InventoryStorageRow) => {
    if (!storage.canDelete) {
      return;
    }

    void showModal({
      title: t('storages.deleteTitle', { name: storage.name }),
      description: t('storages.deleteBody'),
      actions: [
        { label: t('common.cancel'), tone: 'ghost' },
        {
          label: t('common.delete'),
          tone: 'danger',
          onSelect: async () => {
            const result = await deleteStorage(storage.id);

            if (!result.success) {
              void showModal({
                title: t('storages.deleteErrorTitle'),
                description: result.message,
                actions: [{ label: t('common.close'), tone: 'primary' }],
                size: 'sm',
              });
              return;
            }

            onRefresh();
          },
        },
      ],
      size: 'sm',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{t('storages.description')}</p>
        <button
          type="button"
          onClick={handleAddStorage}
          className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
        >
          {t('storages.addStorage')}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70">
        <StoragesTable
          storages={storages}
          locationLabel={locationLabel}
          onEdit={handleEditStorage}
          onDelete={handleDeleteStorage}
          labels={{
            name: t('storages.table.name'),
            location: t('storages.table.location'),
            createdAt: t('storages.table.createdAt'),
            actions: t('storages.table.actions'),
            empty: t('storages.table.empty'),
            editAria: (name) => t('storages.editAria', { name }),
            deleteAria: (name) => t('storages.deleteAria', { name }),
          }}
        />
      </div>
    </div>
  );
}
