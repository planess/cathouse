'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useRef } from 'react';

import type { SerializedObservation } from '@app/api/registry/[animalId]/observations/route';
import { useModal } from '@app/hooks/use-modal';

import Btn from './btn';
import {
  ObservationForm,
  type ObservationFormHandle,
} from './observation-form';

import type { InformatorOption } from '../types';

type AddObservationProps = {
  animalId: string;
  informatorOptions: InformatorOption[];
  canReadRegistryMap: boolean;
};

export default function AddObservation({
  animalId,
  informatorOptions,
  canReadRegistryMap,
}: AddObservationProps) {
  const t = useTranslations('historypage');
  const modal = useModal();
  const router = useRouter();
  const formRef = useRef<ObservationFormHandle | null>(null);

  const handler = useCallback(async () => {
    const result = await modal.showModal<SerializedObservation>({
      title: t('personal.add_observation'),
      content: () => (
        <ObservationForm
          ref={formRef}
          animalId={animalId}
          canReadRegistryMap={canReadRegistryMap}
          informatorOptions={informatorOptions}
        />
      ),
      dismissible: false,
      size: 'lg',
      actions: [
        { label: t('personal.form.close'), value: void 0 },
        {
          label: t('personal.form.submit'),
          tone: 'primary',
          onSelect: () => {
            if (!formRef.current) {
              throw new Error('Observation form is not ready yet.');
            }

            return formRef.current.submit();
          },
        },
      ],
    });

    if (result) {
      router.refresh();
    }
  }, [animalId, informatorOptions, modal, router, t]);

  return <Btn onClick={handler}>{t('personal.add_observation')}</Btn>;
}
