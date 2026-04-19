import { useTranslations } from 'next-intl';

import { createCategory, updateCategory } from '@app/actions/finance';
import { useModal } from '@app/hooks/use-modal';

import {
  collectNodeIds,
  excludeNodesById,
  findNodeById,
} from '../helpers/category-tree-utils';
import { handleDeleteCategory } from '../helpers/handle-delete-category';
import {
  CategoryModalOptions,
  CategoryModalState,
} from '../models/props/category-modal-options';
import { CategoryPanelProps } from '../models/props/category-panel-props';
import { TranslationFn } from '../models/transform-fn';

import CategoryTree from './category-tree';
import IncomingCategoryForm from './incoming-category-form';

export default function CategoryPanel({
  title,
  categories,
  options,
  onRefresh,
}: CategoryPanelProps) {
  const t = useTranslations('adminFinance');
  const { showModal } = useModal();
  const translate: TranslationFn = (key, values) =>
    t(key, values as Record<string, string | number | Date> | undefined);

  const openCategoryModal = ({
    title,
    submitLabel,
    initialState,
    categories,
    allowActiveEdit,
    onSubmit,
  }: CategoryModalOptions) => {
    const formStateRef = { current: initialState };

    void showModal({
      title,
      content: (
        <IncomingCategoryForm
          categories={categories}
          initialState={initialState}
          allowActiveEdit={allowActiveEdit}
          onChange={(nextState) => {
            formStateRef.current = nextState as CategoryModalState;
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
    openCategoryModal({
      title: t('categories.addTitle', { title }),
      submitLabel: t('common.create'),
      initialState: {
        name: '',
        inheritsId: '',
        active: true,
      },
      categories,
      allowActiveEdit: false,
      onSubmit: async (state) => {
        await createCategory({
          name: state.name,
          inheritsId: state.inheritsId,
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

    const editingNode = findNodeById(categories, categoryId);
    const excludedIds = new Set<string>([categoryId]);

    if (editingNode !== null) {
      collectNodeIds(editingNode).forEach((id) => excludedIds.add(id));
    }

    const selectableCategories = excludeNodesById(categories, excludedIds);

    openCategoryModal({
      title: t('categories.editTitle', { name: category.name }),
      submitLabel: t('common.saveChanges'),
      initialState: {
        name: category.name,
        inheritsId: category.inheritsFrom ?? '',
        active: category.active,
      },
      categories: selectableCategories,
      allowActiveEdit: true,
      onSubmit: async (state) => {
        await updateCategory({
          id: categoryId,
          name: state.name,
          inheritsId: state.inheritsId,
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
            onEdit={handleEditCategory}
            onDelete={(categoryId) =>
              void handleDeleteCategory({
                categoryId,
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
