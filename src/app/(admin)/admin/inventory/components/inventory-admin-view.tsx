'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useModal } from '@app/hooks/use-modal';

import { InventoryAdminHeader } from './inventory-admin-view/inventory-admin-header';
import { openAcceptanceFormModal } from './inventory-admin-view/open-acceptance-form-modal';
import { CategoriesModal } from './inventory-categories-modal';
import { StoragesModal } from './inventory-storages-modal';
import { InventoryTable } from './inventory-table';

import type { InventoryAdminViewProps } from '../types/inventory.types';

export function InventoryAdminView({
  storages,
  categories,
  categoryOptions,
  peopleOptions,
  clinicOptions,
  volunteerOptions,
  tableCategories,
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

  const openAcceptanceForm = () => {
    openAcceptanceFormModal({
      showModal,
      storages,
      categories,
      peopleOptions,
      clinicOptions,
      volunteerOptions,
      labels: {
        title: t('reports.addTitle'),
        cancel: t('common.cancel'),
        create: t('common.create'),
        submitErrorTitle: t('reports.submitErrorTitle'),
        close: t('common.close'),
      },
      onRefresh: () => {
        router.refresh();
      },
    });
  };

  const handleAddReport = () => {
    openAcceptanceForm();
  };

  return (
    <div className="space-y-6">
      <InventoryAdminHeader
        title={t('title')}
        subtitle={t('subtitle')}
        storagesLabel={t('actions.manageStorages')}
        categoriesLabel={t('actions.manageCategories')}
        addItemLabel={t('actions.addItem')}
        onOpenStorages={handleOpenStorages}
        onOpenCategories={handleOpenCategories}
        onAddItem={handleAddReport}
      />

      <section className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
        <InventoryTable
          categories={tableCategories}
          storages={storages}
          peopleOptions={peopleOptions}
          clinicOptions={clinicOptions}
          volunteerOptions={volunteerOptions}
        />
      </section>
    </div>
  );
}
