import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { ClockIcon } from '@app/components/icons/registry-animal-c-lo-ck-ic-on';
import { AnimalDocument } from '@app/models/animal';
import { Sterilized } from '@app/models/db/sterilized';

import { formatDate, getAgeLabel } from '../../components/card/card.helpers';
import { formatInputDate } from '../format-input-date';
import {
  ClinicOption,
  EditInfoInitialValues,
  InformatorOption,
} from '../types';

import EditInfo from './edit-info';

interface InfoSectionProps {
  animal: AnimalDocument;
  canEdit: boolean;
  informatorOptions: InformatorOption[];
  clinicOptions: ClinicOption[];
  sterilizedRecord?: Sterilized;
}

export default function InfoSection({
  sterilizedRecord,
  animal,
  canEdit,
  informatorOptions,
  clinicOptions,
}: InfoSectionProps) {
  const cardTranslations = useTranslations('historypage.card');
  const trimmedName = typeof animal.name === 'string' ? animal.name.trim() : '';
  const hasName = trimmedName.length > 0;
  const nameText = hasName ? trimmedName : cardTranslations('nameFallback');
  const ageLabel = getAgeLabel(animal.birthday, cardTranslations);
  const createdAtFormatted = formatDate(animal.createdAt);
  const createdChipLabel = createdAtFormatted
    ? cardTranslations('labels.createdAt', { date: createdAtFormatted })
    : null;
  const editInfoInitialValues: EditInfoInitialValues = {
    name: animal.name ?? '',
    birthday: formatInputDate(animal.birthday),
    description: animal.description ?? '',
    passportCode: animal.passportCode ?? '',
    chipNumber: animal.chipNumber ?? '',
    informator: animal.informator?.toString(),
    status: animal.status as EditInfoInitialValues['status'],
    sterilized: sterilizedRecord
      ? {
        date: formatInputDate(sterilizedRecord.date),
        method: sterilizedRecord.method ?? '',
        clinic: sterilizedRecord.clinic?.toString(),
      }
      : null,
  };

  return (
    <>
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1
            className={clsx(
              'text-3xl font-bold lg:text-4xl transition-colors',
              hasName
                ? 'text-slate-900 dark:text-slate-200'
                : 'text-slate-400 dark:text-slate-400',
            )}
          >
            {nameText}
          </h1>
          <div className="text-sm text-slate-600 dark:text-slate-300 transition-colors">
            {ageLabel}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {createdChipLabel && (
            <span className="flex gap-2 items-center text-sm bg-slate-100 text-slate-500 rounded-full px-3 py-1 dark:bg-slate-500 dark:text-slate-100 transition-colors">
              <ClockIcon /> <span>{createdChipLabel}</span>
            </span>
          )}
          {canEdit && (
            <EditInfo
              animalId={animal._id?.toString() ?? ''}
              initialValues={editInfoInitialValues}
              informatorOptions={informatorOptions}
              clinicOptions={clinicOptions}
            />
          )}
        </div>
      </div>

      <div className="mt-4 text-slate-600 dark:text-slate-200 transition-colors">
        <p className="text-base ">{animal.description}</p>
      </div>
    </>
  );
}
