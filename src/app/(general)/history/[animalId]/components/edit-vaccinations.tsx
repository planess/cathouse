'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useRef } from 'react';

import { useModal } from '@app/hooks/use-modal';

import { EditButton } from './edit-button';
import {
  EditVaccinationsForm,
  type EditVaccinationsFormHandle,
} from './edit-vaccinations-form';

import type { ClinicOption, VaccinationModalInitialValues } from '../types';

type EditVaccinationsProps = {
  animalId: string;
  initialValues: VaccinationModalInitialValues;
  clinicOptions: ClinicOption[];
};

export default function EditVaccinations({
  animalId,
  initialValues,
  clinicOptions,
}: EditVaccinationsProps) {
  const t = useTranslations('historypage.personal');
  const modal = useModal();
  const router = useRouter();
  const formRef = useRef<EditVaccinationsFormHandle | null>(null);

  const editHandler = useCallback(async () => {
    const result = await modal.showModal<'updated'>({
      title: t('form.vaccinations_modal.title'),
      description: t('form.vaccinations_modal.description'),
      content: () => (
        <EditVaccinationsForm
          ref={formRef}
          animalId={animalId}
          initialValues={initialValues}
          clinicOptions={clinicOptions}
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
              throw new Error('Edit vaccinations form is not ready yet.');
            }

            return formRef.current.submit();
          },
        },
      ],
    });

    if (result === 'updated') {
      router.refresh();
    }
  }, [animalId, clinicOptions, initialValues, modal, router, t]);

  return (
    <EditButton label={t('edit_vaccinations_label')} onClick={editHandler} />
  );
}
