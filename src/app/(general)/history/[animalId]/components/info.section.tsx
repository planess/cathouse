import { AnimalDocument } from '@app/models/animal';
import { Sterilized } from '@app/models/db/sterilized';
import { formatDate, getAgeLabel } from '../../components/card/card.helpers';
import EditInfo from './edit-info';
import { ClockIcon } from './icons';
import { formatInputDate } from '../format-input-date';
import {
  ClinicOption,
  EditInfoInitialValues,
  InformatorOption,
} from '../types';

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
  const ageLabel = getAgeLabel(animal.birthday);
  const editInfoInitialValues: EditInfoInitialValues = {
    name: animal.name,
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
          <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
            {animal.name}
          </h1>
          <div className="text-sm text-slate-600">{ageLabel}</div>
        </div>

        <div className="flex gap-2 items-center">
          <span className="flex gap-2 items-center text-sm bg-slate-100 text-slate-500 rounded-full px-3 py-1">
            <ClockIcon /> <span>Created: {formatDate(animal.createdAt)}</span>
          </span>
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

      <div className="mt-4">
        <p className="text-base text-slate-600">{animal.description}</p>
      </div>
    </>
  );
}
