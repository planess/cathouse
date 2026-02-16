import { deleteCategory } from '@app/actions/finance.server';
import { useModal } from '@app/hooks/use-modal';

import { TranslationFn } from '../models/transform-fn';

export async function handleDeleteCategory({
  categoryId,
  type,
  onRefresh,
  showModal,
  t,
}: {
  categoryId: string;
  type: 'incoming' | 'outgoing';
  onRefresh: () => void;
  showModal: ReturnType<typeof useModal>['showModal'];
  t: TranslationFn;
}) {
  const result = await deleteCategory({ id: categoryId, name: '', type });

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
