import { useTranslations } from 'next-intl';

import { CategoryNode } from '../models/category-node';
import {
  CategoryIncomingOption,
  CategoryOption,
} from '../models/category-option';

import CategoryPanel from './category-panel';

export default function CategoriesModal({
  incoming,
  outgoing,
  incomingOptions,
  outgoingOptions,
  onRefresh,
}: {
  incoming: CategoryNode[];
  outgoing: CategoryNode[];
  incomingOptions: CategoryIncomingOption[];
  outgoingOptions: CategoryOption[];
  onRefresh: () => void;
}) {
  const t = useTranslations('adminFinance');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CategoryPanel
        title={t('categories.incomingTitle')}
        categories={incoming}
        incomingCategories={incoming}
        options={incomingOptions}
        type="incoming"
        onRefresh={onRefresh}
      />
      <CategoryPanel
        title={t('categories.outgoingTitle')}
        categories={outgoing}
        incomingCategories={incoming}
        options={outgoingOptions}
        type="outgoing"
        onRefresh={onRefresh}
      />
    </div>
  );
}
