import { useTranslations } from 'next-intl';

import { CategoriesModalProps } from '../models/props/categories-modal-props';

import CategoryPanel from './category-panel';

export default function CategoriesModal({
  categories,
  options,
  onRefresh,
}: CategoriesModalProps) {
  const t = useTranslations('adminFinance');

  return (
    <div className="grid gap-6">
      <CategoryPanel
        title={t('categories.outgoingTitle')}
        categories={categories}
        options={options}
        onRefresh={onRefresh}
      />
    </div>
  );
}
