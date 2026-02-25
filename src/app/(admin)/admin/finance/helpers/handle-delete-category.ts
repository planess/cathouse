import { deleteCategory } from '@app/actions/finance';
import { useModal } from '@app/hooks/use-modal';

import { TranslationFn } from '../models/transform-fn';

export async function handleDeleteCategory({
  categoryId,
  onRefresh,
  showModal,
  t,
}: {
  categoryId: string;
  onRefresh: () => void;
  showModal: ReturnType<typeof useModal>['showModal'];
  t: TranslationFn;
}) {
  const result = await deleteCategory({ id: categoryId, name: '' });

  if (!result.success) {
    void showModal({
      title: t('categories.deleteErrorTitle'),
      description: result.message,
      actions: [
        {
          label: t('common.close'),
          tone: 'primary',
        },
      ],
      size: 'sm',
    });
    return;
  }

  onRefresh();
}
