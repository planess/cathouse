'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useModal } from '@app/hooks/use-modal';

import InventoryFilter from './inventory-filter';
import { CategoryNode } from './inventory-table/category-node';
import { openTransferFormModal } from './inventory-table/open-transfer-form-modal';

import type { InventoryTableProps } from '../types/inventory-component-props.types';
import type { InventoryEntityRow } from '../types/inventory.types';

export function InventoryTable({
  categories,
  storages,
  peopleOptions,
  clinicOptions,
  volunteerOptions,
}: InventoryTableProps) {
  const router = useRouter();
  const { showModal } = useModal();
  const t = useTranslations('adminInventory');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (rowId: string) => {
    setExpandedRows((current) => ({
      ...current,
      [rowId]: current[rowId] !== true,
    }));
  };

  const openTransferForm = (entity: InventoryEntityRow) => {
    openTransferFormModal({
      showModal,
      entity,
      storages,
      peopleOptions,
      clinicOptions,
      volunteerOptions,
      labels: {
        title: t('transfers.addTitle'),
        cancel: t('common.cancel'),
        create: t('common.create'),
        submitErrorTitle: t('transfers.submitErrorTitle'),
        close: t('common.close'),
      },
      onRefresh: () => {
        router.refresh();
      },
    });
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <InventoryFilter />

      <div className="p-4">
        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#d5e4de] px-4 py-8 text-center text-sm text-[#527a6d] dark:border-slate-700 dark:text-slate-400">
            {t('table.empty')}
          </p>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <CategoryNode
                key={category.id}
                node={category}
                depth={0}
                expandedRows={expandedRows}
                onToggleRow={toggleRow}
                  onOpenTransfer={openTransferForm}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
