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
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-5 py-3">{t('storages.table.name')}</th>
              <th className="px-5 py-3">{t('storages.table.location')}</th>
              <th className="px-5 py-3">{t('storages.table.createdAt')}</th>
              <th className="px-5 py-3 text-right">
                {t('storages.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {storages.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-6 text-center text-sm text-slate-500"
                >
                  {t('storages.table.empty')}
                </td>
              </tr>
            ) : (
              storages.map((storage) => (
                <tr key={storage.id}>
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {storage.name}
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-slate-500">
                    {locationLabel(storage)}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {storage.createdAt || '-'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditStorage(storage)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:text-sky-500"
                        aria-label={t('storages.editAria', {
                          name: storage.name,
                        })}
                      >
                        ✎
                      </button>
                      {storage.canDelete ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteStorage(storage)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:text-rose-500"
                          aria-label={t('storages.deleteAria', {
                            name: storage.name,
                          })}
                        >
                          ✕
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
