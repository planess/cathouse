import { useTranslations } from 'next-intl';

import {
  createIncomingCategory,
  createOutgoingCategory,
  updateIncomingCategory,
  updateOutgoingCategory,
} from '@app/actions/finance.server';
import { useModal } from '@app/hooks/use-modal';

import { handleDeleteCategory } from '../helpers/handle-delete-category';
import { CategoryNode } from '../models/category-node';
import {
  CategoryIncomingOption,
  CategoryOption,
  CategoryOutgoingOption,
} from '../models/category-option';
import { TranslationFn } from '../models/transform-fn';

import CategoryTree from './category-tree';
import IncomingCategoryForm from './incoming-category-form';
import OutgoingCategoryForm from './outgoing-category-form';

function collectNodeIds(node: CategoryNode): Set<string> {
  const ids = new Set<string>([node.id]);

  node.children.forEach((child) => {
    collectNodeIds(child).forEach((id) => ids.add(id));
  });

  return ids;
}

function excludeNodesById(
  nodes: CategoryNode[],
  excludedIds: Set<string>,
): CategoryNode[] {
  return nodes
    .filter((node) => !excludedIds.has(node.id))
    .map((node) => ({
      ...node,
      children: excludeNodesById(node.children, excludedIds),
    }));
}

function findNodeById(nodes: CategoryNode[], nodeId: string): CategoryNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    const match = findNodeById(node.children, nodeId);

    if (match) {
      return match;
    }
  }

  return null;
}

export default function CategoryPanel({
  title,
  categories,
  incomingCategories,
  options,
  type,
  onRefresh,
}: {
  title: string;
  categories: CategoryNode[];
  incomingCategories?: CategoryNode[];
  options: CategoryOption[] | CategoryIncomingOption[] | CategoryOutgoingOption[];
  type: 'incoming' | 'outgoing';
  onRefresh: () => void;
}) {
  const t = useTranslations('adminFinance');
  const { showModal } = useModal();
  const incomingOptions = options as CategoryIncomingOption[];
  const outgoingOptions = options as CategoryOutgoingOption[];
  const updateIncomingCategoryAction = updateIncomingCategory as (payload: {
    id: string;
    name: string;
    inheritsId?: string;
    active: boolean;
    specific: boolean;
  }) => Promise<{ success: boolean; message: string }>;
  const updateOutgoingCategoryAction = updateOutgoingCategory as (payload: {
    id: string;
    name: string;
    inheritsId?: string;
    linkedToId?: string;
    active: boolean;
  }) => Promise<{ success: boolean; message: string }>;
  const translate: TranslationFn = (key, values) =>
    t(key, values as Record<string, string | number | Date> | undefined);

  const openOutgoingCategoryModal = ({
    title,
    submitLabel,
    initialState,
    outgoingCategories,
    incomingCategories,
    allowActiveEdit,
    onSubmit,
  }: {
    title: string;
    submitLabel: string;
    initialState: {
      name: string;
      inheritsId: string;
      linkedToId: string;
      active: boolean;
    };
    outgoingCategories: CategoryNode[];
    incomingCategories: CategoryNode[];
    allowActiveEdit: boolean;
    onSubmit: (state: {
      name: string;
      inheritsId: string;
      linkedToId: string;
      active: boolean;
    }) => Promise<void>;
  }) => {
    const formStateRef = { current: initialState };

    void showModal({
      title,
      content: (
        <OutgoingCategoryForm
          outgoingCategories={outgoingCategories}
          incomingCategories={incomingCategories}
          initialState={initialState}
          allowActiveEdit={allowActiveEdit}
          onChange={(nextState) => {
            formStateRef.current = nextState;
          }}
        />
      ),
      actions: [
        { label: t('common.cancel'), tone: 'ghost' },
        {
          label: submitLabel,
          tone: 'primary',
          onSelect: async () => {
            await onSubmit(formStateRef.current);
            onRefresh();
          },
        },
      ],
      size: 'lg',
    });
  };

  const openIncomingCategoryModal = ({
    title,
    submitLabel,
    initialState,
    categories,
    allowActiveEdit,
    onSubmit,
  }: {
    title: string;
    submitLabel: string;
    initialState: {
      name: string;
      inheritsId: string;
      active: boolean;
      specific: boolean;
    };
    categories: CategoryNode[];
    allowActiveEdit: boolean;
    onSubmit: (state: {
      name: string;
      inheritsId: string;
      active: boolean;
      specific: boolean;
    }) => Promise<void>;
  }) => {
    const formStateRef = { current: initialState };

    void showModal({
      title,
      content: (
        <IncomingCategoryForm
          categories={categories}
          initialState={initialState}
          allowActiveEdit={allowActiveEdit}
          onChange={(nextState) => {
            formStateRef.current = nextState;
          }}
        />
      ),
      actions: [
        { label: t('common.cancel'), tone: 'ghost' },
        {
          label: submitLabel,
          tone: 'primary',
          onSelect: async () => {
            await onSubmit(formStateRef.current);
            onRefresh();
          },
        },
      ],
      size: 'lg',
    });
  };

  const handleAddCategory = () => {
    if (type === 'incoming') {
      openIncomingCategoryModal({
        title: t('categories.addTitle', { title }),
        submitLabel: t('common.create'),
        initialState: {
          name: '',
          inheritsId: '',
          active: true,
          specific: false,
        },
        categories,
        allowActiveEdit: false,
        onSubmit: async (state) => {
          await createIncomingCategory({
            name: state.name,
            inheritsId: state.inheritsId,
            active: true,
            specific: state.specific,
          });
        },
      });

      return;
    }

    openOutgoingCategoryModal({
      title: t('categories.addTitle', { title }),
      submitLabel: t('common.create'),
      initialState: {
        name: '',
        inheritsId: '',
        linkedToId: '',
        active: true,
      },
      outgoingCategories: categories,
      incomingCategories: incomingCategories ?? [],
      allowActiveEdit: false,
      onSubmit: async (state) => {
        await createOutgoingCategory({
          name: state.name,
          inheritsId: state.inheritsId,
          linkedToId: state.linkedToId,
          active: true,
        });
      },
    });
  };

  const handleEditCategory = (categoryId: string) => {
    const category = options.find((option) => option.id === categoryId);

    if (!category) {
      return;
    }

    if (type === 'incoming') {
      const incomingCategory = incomingOptions.find(
        (option) => option.id === categoryId,
      );

      if (!incomingCategory) {
        return;
      }

      const editingNode = findNodeById(categories, categoryId);

      const excludedIds = new Set<string>([categoryId]);

      if (editingNode !== null) {
        collectNodeIds(editingNode).forEach((id) => excludedIds.add(id));
      }

      const selectableCategories = excludeNodesById(categories, excludedIds);

      openIncomingCategoryModal({
        title: t('categories.editTitle', { name: incomingCategory.name }),
        submitLabel: t('common.saveChanges'),
        initialState: {
          name: incomingCategory.name,
          inheritsId: incomingCategory.inheritsFrom ?? '',
          active: incomingCategory.active,
          specific: incomingCategory.specific,
        },
        categories: selectableCategories,
        allowActiveEdit: true,
        onSubmit: async (state) => {
          await updateIncomingCategoryAction({
            id: categoryId,
            name: state.name,
            inheritsId: state.inheritsId,
            active: state.active,
            specific: state.specific,
          });
        },
      });

      return;
    }

    const editingNode = findNodeById(categories, categoryId);
    const excludedIds = new Set<string>([categoryId]);
    const outgoingCategory = outgoingOptions.find(
      (option) => option.id === categoryId,
    );

    if (editingNode !== null) {
      collectNodeIds(editingNode).forEach((id) => excludedIds.add(id));
    }

    const selectableOutgoingCategories = excludeNodesById(categories, excludedIds);

    openOutgoingCategoryModal({
      title: t('categories.editTitle', { name: category.name }),
      submitLabel: t('common.saveChanges'),
      initialState: {
        name: category.name,
        inheritsId: category.inheritsFrom ?? '',
        linkedToId: outgoingCategory?.linkedToIncoming ?? '',
        active: outgoingCategory?.active ?? true,
      },
      outgoingCategories: selectableOutgoingCategories,
      incomingCategories: incomingCategories ?? [],
      allowActiveEdit: true,
      onSubmit: async (state) => {
        await updateOutgoingCategoryAction({
          id: categoryId,
          name: state.name,
          inheritsId: state.inheritsId,
          linkedToId: state.linkedToId,
          active: state.active,
        });
      },
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {t('categories.panelTitle', { title })}
        </h3>
        <button
          className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
          type="button"
          onClick={handleAddCategory}
        >
          {t('categories.addCategory')}
        </button>
      </div>
      <div className="mt-4">
        {categories.length === 0 ? (
          <p className="text-xs text-slate-400">
            {t('categories.noCategories')}
          </p>
        ) : (
          <CategoryTree
            nodes={categories}
            type={type}
            onEdit={handleEditCategory}
            onDelete={(categoryId) =>
              void handleDeleteCategory({
                categoryId,
                type,
                onRefresh,
                showModal,
                t: translate,
              })
            }
          />
        )}
      </div>
    </div>
  );
}
