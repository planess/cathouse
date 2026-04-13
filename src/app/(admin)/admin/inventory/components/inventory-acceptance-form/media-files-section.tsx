import { useTranslations } from 'next-intl';

import { inputClassName } from '../common/input-class-name';
import { MediaFilesField } from '../common/media-files-field';

import { DOCUMENT_AND_IMAGE_ACCEPT } from './constants';

import type { UpdateAcceptanceState } from './types';
import type { InventoryAcceptanceFormState } from '../../types/inventory.types';

type MediaFilesSectionProps = {
  formState: InventoryAcceptanceFormState;
  updateState: UpdateAcceptanceState;
};

export function MediaFilesSection({
  formState,
  updateState,
}: MediaFilesSectionProps) {
  const t = useTranslations('adminInventory');

  return (
    <MediaFilesField
      label="Documents and images"
      hint="Upload images or documents. Video files are not accepted."
      files={formState.mediaFiles}
      accept={DOCUMENT_AND_IMAGE_ACCEPT}
      inputClassName={inputClassName()}
      removeLabel={t('reports.form.removeImage')}
      onAddFiles={(files) => {
        const acceptedFiles = files.filter(
          (file) => file.size > 0 && !file.type.startsWith('video/'),
        );

        if (acceptedFiles.length === 0) {
          return;
        }

        updateState({
          ...formState,
          mediaFiles: [...formState.mediaFiles, ...acceptedFiles],
        });
      }}
      onRemoveFile={(index) => {
        updateState({
          ...formState,
          mediaFiles: formState.mediaFiles.filter((_, i) => i !== index),
        });
      }}
    />
  );
}
