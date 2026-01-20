import { getTranslations } from 'next-intl/server';

import { AnimalDocument } from '@app/models/animal';

import { buildTreatmentInitialValues } from '../build-treatment-initial-values';
import { ClinicOption } from '../types';
import { sortTreatments } from '../utils';

import AddTreatment from './add-treatment';
import { EmptyState } from './empty-state';
import { TreatmentCard } from './treatment-card';

interface TreatmentSectionProps {
  canEdit: boolean;
  clinicOptions: ClinicOption[];
  animal: AnimalDocument;
}

export default async function TreatmentSection({
  animal,
  canEdit,
  clinicOptions,
}: TreatmentSectionProps) {
  const t = await getTranslations('historypage');

  const treatments = sortTreatments(animal.vetTreatments);
  const canAddTreatment =
    canEdit && treatments.every((record) => Boolean(record.endDate));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-900 dark:text-slate-200">
          {t('personal.treatments')}
        </h2>

        {canAddTreatment && (
          <AddTreatment
            animalId={animal._id?.toString() ?? ''}
            clinicOptions={clinicOptions}
          />
        )}
      </div>

      {treatments.length === 0 ? (
        <EmptyState message={t('personal.treatments_empty')} />
      ) : (
        <div className="space-y-3">
          {treatments.map((treatment, index) => {
            const initialValues = buildTreatmentInitialValues(treatment);

            return (
              <TreatmentCard
                key={`treatment-${treatment.startDate?.toISOString?.() ?? index}`}
                treatment={treatment}
                treatmentIndex={index}
                canEdit={canEdit}
                animalId={animal._id?.toString() ?? ''}
                clinicOptions={clinicOptions}
                initialValues={initialValues}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
