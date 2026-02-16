'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '@app/actions/inventory.server';
import { useModal } from '@app/hooks/use-modal';

import { CategoryForm } from './inventory-category-form';
import { CategoryTree } from './inventory-category-tree';

import type {
  CategoryFormState,
  InventoryCategoryRow,
  InventoryCategoryNode,
  InventoryCategoryOption,
} from '../types/inventory.types';

type CategoriesModalProps = {
  categories: InventoryCategoryNode[];
  options: InventoryCategoryOption[];
  onRefresh: () => void;
};

export function CategoriesModal({
  categories,
  options,
  onRefresh,
}: CategoriesModalProps) {
  const t = useTranslations('adminInventory');
  const { showModal } = useModal();

  const categoryNameMap = useMemo(
    () => new Map(options.map((option) => [option.id, option.name])),
    [options],
  );
  const inheritsMap = useMemo(
    () => new Map(options.map((option) => [option.id, option.inheritsFrom])),
    [options],
  );

  const rows = useMemo<InventoryCategoryRow[]>(() => {
    const flattened: InventoryCategoryRow[] = [];

    const walk = (node: InventoryCategoryNode, depth: number) => {
      const inheritsFrom = inheritsMap.get(node.id) ?? null;
      const parentName =
        typeof inheritsFrom === 'string' && inheritsFrom.length > 0
          ? (categoryNameMap.get(inheritsFrom) ?? '')
          : '';

      flattened.push({
        id: node.id,
        name: node.name,
        createdAt: node.createdAt,
        parentName,
        depth,
        hasChildren: node.children.length > 0,
      });

      node.children.forEach((child) => walk(child, depth + 1));
    };

    categories.forEach((category) => walk(category, 0));

    return flattened;
  }, [categories, categoryNameMap, inheritsMap]);

  const openCategoryForm = (formOptions: {
    title: string;
    submitLabel: string;
    initialState: CategoryFormState;
    availableOptions: InventoryCategoryOption[];
    onSubmit: (state: CategoryFormState) => Promise<void>;
  }) => {
    const formStateRef: { current: CategoryFormState } = {
      current: formOptions.initialState,
    };
    const formValidityRef = { current: false };

    const modalHandle = showModal({
      title: formOptions.title,
      content: (
        <CategoryForm
          initialState={formOptions.initialState}
          options={formOptions.availableOptions}
          onChange={(nextState) => {
            formStateRef.current = nextState;
          }}
          onValidityChange={(isValid) => {
            formValidityRef.current = isValid;
            modalHandle.setActionEnabled('category-submit', isValid);
          }}
        />
      ),
      actions: [
        { label: t('common.cancel'), tone: 'ghost' },
        {
          id: 'category-submit',
          label: formOptions.submitLabel,
          tone: 'primary',
          disabled: !formValidityRef.current,
          onSelect: async () => {
            if (!formValidityRef.current) {
              return;
            }
            await formOptions.onSubmit(formStateRef.current);
            onRefresh();
          },
        },
      ],
      size: 'sm',
    });
  };

  const handleAddCategory = () => {
    openCategoryForm({
      title: t('categories.addTitle'),
      submitLabel: t('common.create'),
      initialState: { name: '', inheritsId: '' },
      availableOptions: options,
      onSubmit: async (state: CategoryFormState) => {
        await createCategory({
          name: state.name,
          inheritsId: state.inheritsId,
        });
      },
    });
  };

  const handleEditCategory = (row: InventoryCategoryRow) => {
    const excludedIds = collectDescendantIds(categories, row.id);
    const availableOptions = options.filter(
      (option) => !excludedIds.has(option.id),
    );

    openCategoryForm({
      title: t('categories.editTitle', { name: row.name }),
      submitLabel: t('common.saveChanges'),
      initialState: {
        name: row.name,
        inheritsId:
          options.find((option) => option.id === row.id)?.inheritsFrom ?? '',
      },
      availableOptions,
      onSubmit: async (state: CategoryFormState) => {
        await updateCategory({
          id: row.id,
          name: state.name,
          inheritsId: state.inheritsId,
        });
      },
    });
  };

  const handleDeleteCategory = (row: InventoryCategoryRow) => {
    void showModal({
      title: t('categories.deleteTitle', { name: row.name }),
      description: t('categories.deleteBody'),
      actions: [
        { label: t('common.cancel'), tone: 'ghost' },
        {
          label: t('common.delete'),
          tone: 'danger',
          onSelect: async () => {
            const result = await deleteCategory(row.id);

            if (!result.success) {
              void showModal({
                title: t('categories.deleteErrorTitle'),
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
        <p className="text-sm text-slate-500">{t('categories.description')}</p>
        <button
          type="button"
          onClick={handleAddCategory}
          className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
        >
          {t('categories.addCategory')}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70">
        <CategoryTree
          rows={rows}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          emptyState={t('categories.empty')}
          labels={{
            name: t('categories.table.name'),
            inherits: t('categories.table.inherits'),
            createdAt: t('categories.table.createdAt'),
            actions: t('categories.table.actions'),
            edit: t('common.edit'),
            delete: t('common.delete'),
          }}
        />
      </div>
    </div>
  );
}

function collectDescendantIds(
  categories: InventoryCategoryNode[],
  rootId: string,
) {
  const ids = new Set<string>();

  const findNode = (
    nodes: InventoryCategoryNode[],
  ): InventoryCategoryNode | null => {
    for (const node of nodes) {
      if (node.id === rootId) {
        return node;
      }

      const match = findNode(node.children);
      if (match) {
        return match;
      }
    }

    return null;
  };

  const walk = (node: InventoryCategoryNode) => {
    ids.add(node.id);
    node.children.forEach(walk);
  };

  const root = findNode(categories);
  if (root) {
    walk(root);
  }

  return ids;
}
