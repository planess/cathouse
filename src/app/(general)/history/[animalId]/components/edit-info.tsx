'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useRef } from 'react';

import { useModal } from '@app/hooks/use-modal';

import { EditButton } from './edit-button';
import { EditInfoForm, type EditInfoFormHandle } from './edit-info-form';

import type {
  ClinicOption,
  EditInfoInitialValues,
  InformatorOption,
} from '../types';

type EditInfoProps = {
  animalId: string;
  initialValues: EditInfoInitialValues;
  informatorOptions: InformatorOption[];
  clinicOptions: ClinicOption[];
};

export default function EditInfo({
  animalId,
  initialValues,
  informatorOptions,
  clinicOptions,
}: EditInfoProps) {
  const t = useTranslations('historypage.personal');
  const modal = useModal();
  const router = useRouter();
  const formRef = useRef<EditInfoFormHandle | null>(null);

  const editHandler = useCallback(async () => {
    const result = await modal.showModal<'updated'>({
      title: t('form.edit_modal_title'),
      description: t('form.edit_modal_description'),
      content: () => (
        <EditInfoForm
          ref={formRef}
          animalId={animalId}
          initialValues={initialValues}
          informatorOptions={informatorOptions}
          clinicOptions={clinicOptions}
        />
      ),
      dismissible: false,
      size: 'lg',
      actions: [
        { label: t('form.cancel'), value: void 0 },
        {
          label: t('form.save'),
          tone: 'primary',
          onSelect: () => {
            if (!formRef.current) {
              throw new Error('Edit info form is not ready yet.');
            }

            return formRef.current.submit();
          },
        },
      ],
    });

    if (result === 'updated') {
      router.refresh();
    }
  }, [
    animalId,
    clinicOptions,
    informatorOptions,
    initialValues,
    modal,
    router,
    t,
  ]);

  return <EditButton label={t('edit_button_label')} onClick={editHandler} />;
}
