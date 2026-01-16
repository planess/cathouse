'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useRef } from 'react';

import { useModal } from '@app/hooks/use-modal';

import { EditButton } from './edit-button';
import { TreatmentForm, type TreatmentFormHandle } from './treatment-form';

import type { ClinicOption, TreatmentModalInitialValues } from '../types';

type EditTreatmentProps = {
  animalId: string;
  clinicOptions: ClinicOption[];
  initialValues: TreatmentModalInitialValues;
  treatmentIndex: number;
};

export default function EditTreatment({
  animalId,
  clinicOptions,
  initialValues,
  treatmentIndex,
}: EditTreatmentProps) {
  const t = useTranslations('historypage.personal');
  const modal = useModal();
  const router = useRouter();
  const formRef = useRef<TreatmentFormHandle | null>(null);

  const handler = useCallback(async () => {
    const result = await modal.showModal<'saved'>({
      title: t('form.treatment_modal.title_edit'),
      description: t('form.treatment_modal.description'),
      content: () => (
        <TreatmentForm
          mode="edit"
          ref={formRef}
          animalId={animalId}
          clinicOptions={clinicOptions}
          initialValues={initialValues}
          treatmentIndex={treatmentIndex}
        />
      ),
      dismissible: false,
      size: 'xl',
      actions: [
        { label: t('form.cancel'), value: void 0 },
        {
          label: t('form.save'),
          tone: 'primary',
          onSelect: () => {
            if (!formRef.current) {
              throw new Error('Treatment form is not ready yet.');
            }

            return formRef.current.submit();
          },
        },
      ],
    });

    if (result === 'saved') {
      router.refresh();
    }
  }, [
    animalId,
    clinicOptions,
    initialValues,
    modal,
    router,
    t,
    treatmentIndex,
  ]);

  return (
    <EditButton
      tag="span"
      label={t('form.treatment_modal.edit_label')}
      onClick={handler}
    />
  );
}
