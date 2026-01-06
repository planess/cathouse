'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useRef } from 'react';

import { useModal } from '@app/hooks/use-modal';

import Btn from './btn';
import { TreatmentForm, type TreatmentFormHandle } from './treatment-form';

import type { ClinicOption } from '../types';

type AddTreatmentProps = {
  animalId: string;
  clinicOptions: ClinicOption[];
};

export default function AddTreatment({ animalId, clinicOptions }: AddTreatmentProps) {
  const t = useTranslations('historypage.personal');
  const modal = useModal();
  const router = useRouter();
  const formRef = useRef<TreatmentFormHandle | null>(null);

  const handler = useCallback(async () => {
    const result = await modal.showModal<'saved'>({
      title: t('form.treatment_modal.title_create'),
      description: t('form.treatment_modal.description'),
      content: () => (
        <TreatmentForm
          ref={formRef}
          animalId={animalId}
          clinicOptions={clinicOptions}
          mode="create"
        />
      ),
      dismissible: false,
      size: 'xl',
      actions: [
        { label: t('form.cancel'), value: null },
        {
          label: t('form.submit'),
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
  }, [animalId, clinicOptions, modal, router, t]);

  return <Btn onClick={handler}>{t('add_treatment')}</Btn>;
}
