'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  createInventoryReport,
  updateInventoryReport,
} from '@app/actions/inventory.server';
import { useModal } from '@app/hooks/use-modal';

import { CategoriesModal } from './inventory-categories-modal';
import { InventoryReportForm } from './inventory-report-form';
import { StoragesModal } from './inventory-storages-modal';
import { InventoryTable } from './inventory-table';

import type {
  InventoryAdminViewProps,
  InventoryReportFormState,
} from '../types/inventory.types';

function buildReportFormData(state: InventoryReportFormState, id?: string) {
  const formData = new FormData();

  if (typeof id === 'string' && id.length > 0) {
    formData.set('id', id);
  }

  formData.set('sku', state.sku);
  formData.set('name', state.name);
  formData.set('type', state.type);
  formData.set('quantity', state.quantity);
  formData.set('expirationDate', state.expirationDate);
  formData.set('categoryId', state.categoryId);
  formData.set('storageId', state.storageId);

  state.existingImages.forEach((imageUrl) => {
    formData.append('existingImages', imageUrl);
  });

  state.newImages.forEach((file) => {
    formData.append('images', file);
  });

  return formData;
}

export function InventoryAdminView({
  storages,
  categories,
  categoryOptions,
  reports,
}: InventoryAdminViewProps) {
  const router = useRouter();
  const { showModal } = useModal();
  const t = useTranslations('adminInventory');

  const handleOpenStorages = () => {
    void showModal({
      title: t('storages.modalTitle'),
      content: (
        <StoragesModal storages={storages} onRefresh={() => router.refresh()} />
      ),
      actions: [
        {
          label: t('common.close'),
          tone: 'primary',
        },
      ],
      size: 'xl',
    });
  };

  const handleOpenCategories = () => {
    void showModal({
      title: t('categories.modalTitle'),
      content: (
        <CategoriesModal
          categories={categories}
          options={categoryOptions}
          onRefresh={() => router.refresh()}
        />
      ),
      actions: [
        {
          label: t('common.close'),
          tone: 'primary',
        },
      ],
      size: 'xl',
    });
  };

  const openReportForm = (options: {
    title: string;
    submitLabel: string;
    initialState: InventoryReportFormState;
    onSubmit: (state: InventoryReportFormState) => Promise<{
      success: boolean;
      message: string;
    }>;
  }) => {
    const formStateRef = { current: options.initialState };
    const formValidityRef = { current: false };

    const modalHandle = showModal({
      title: options.title,
      content: (
        <InventoryReportForm
          initialState={options.initialState}
          storages={storages}
          categories={categoryOptions}
          onChange={(nextState) => {
            formStateRef.current = nextState;
          }}
          onValidityChange={(isValid) => {
            formValidityRef.current = isValid;
            modalHandle.setActionEnabled('inventory-submit', isValid);
          }}
        />
      ),
      actions: [
        { label: t('common.cancel'), tone: 'ghost' },
        {
          id: 'inventory-submit',
          label: options.submitLabel,
          tone: 'primary',
          disabled: !formValidityRef.current,
          onSelect: async () => {
            if (!formValidityRef.current) {
              return;
            }

            const result = await options.onSubmit(formStateRef.current);

            if (!result.success) {
              void showModal({
                title: t('reports.submitErrorTitle'),
                description: result.message,
                actions: [{ label: t('common.close'), tone: 'primary' }],
                size: 'sm',
              });
              return;
            }

            router.refresh();
          },
        },
      ],
      size: 'xl',
    });
  };

  const handleAddReport = () => {
    openReportForm({
      title: t('reports.addTitle'),
      submitLabel: t('common.create'),
      initialState: {
        sku: '',
        name: '',
        type: '',
        quantity: '1',
        expirationDate: '',
        categoryId: '',
        storageId: '',
        existingImages: [],
        newImages: [],
      },
      onSubmit: async (state) =>
        createInventoryReport(buildReportFormData(state)),
    });
  };

  const handleEditReport = (
    report: InventoryAdminViewProps['reports'][number],
  ) => {
    openReportForm({
      title: t('reports.editTitle', { name: report.name }),
      submitLabel: t('common.saveChanges'),
      initialState: {
        sku: report.sku,
        name: report.name,
        type: report.type,
        quantity: String(report.quantity),
        expirationDate: report.expirationDateValue,
        categoryId: report.categoryId ?? '',
        storageId: report.storageId ?? '',
        existingImages: report.images,
        newImages: [],
      },
      onSubmit: async (state) =>
        updateInventoryReport(buildReportFormData(state, report.id)),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleOpenStorages}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {t('actions.manageStorages')}
          </button>
          <button
            type="button"
            onClick={handleOpenCategories}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {t('actions.manageCategories')}
          </button>
          <button
            type="button"
            onClick={handleAddReport}
            className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('actions.addItem')}
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex flex-col gap-2 border-b border-slate-200/70 p-6 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('table.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('table.subtitle')}
          </p>
        </div>
        <InventoryTable
          categories={categories}
          reports={reports}
          onEditReport={handleEditReport}
        />
      </section>
    </div>
  );
}
