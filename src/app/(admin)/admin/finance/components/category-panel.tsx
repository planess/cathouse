import { useTranslations } from 'next-intl';

import { createCategory } from '@app/actions/finance.server';
import { useModal } from '@app/hooks/use-modal';

import { handleDeleteCategory } from '../helpers/handle-delete-category';
import { CategoryNode } from '../models/category-node';
import { CategoryOption } from '../models/category-option';

import CategoryForm from './category-form';
import CategoryTree from './category-tree';

export default function CategoryPanel({
  title,
  categories,
  options,
  type,
  onRefresh,
}: {
  title: string;
  categories: CategoryNode[];
  options: CategoryOption[];
  type: 'incoming' | 'outgoing';
  onRefresh: () => void;
}) {
  const t = useTranslations('adminFinance');
  const { showModal } = useModal();

  const handleAddCategory = () => {
    const formStateRef = { current: { name: '', inheritsId: '' } };

    void showModal({
      title: t('categories.addTitle', { title }),
      content: (
        <CategoryForm
          options={options}
          onChange={(nextState) => {
            formStateRef.current = nextState;
          }}
        />
      ),
      actions: [
        { label: t('common.cancel'), tone: 'ghost' },
        {
          label: t('common.create'),
          tone: 'primary',
          onSelect: async () => {
            await createCategory({
              name: formStateRef.current.name,
              inheritsId: formStateRef.current.inheritsId,
              type,
            });
            onRefresh();
          },
        },
      ],
      size: 'sm',
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
            onDelete={(categoryId) =>
              void handleDeleteCategory({
                categoryId,
                type,
                onRefresh,
                showModal,
                t,
              })
            }
          />
        )}
      </div>
    </div>
  );
}
