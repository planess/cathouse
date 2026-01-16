import clsx from 'clsx';
import { getTranslations } from 'next-intl/server';

import { AccordionItem } from '@app/components/accordion';
import type { VetTreatmentRecord } from '@app/models/animal';

import { formatDate } from '../../components/card/card.helpers';

import EditTreatment from './edit-treatment';

import type { ClinicOption, TreatmentModalInitialValues } from '../types';

interface TreatmentCardProps {
  treatment: VetTreatmentRecord;
  treatmentIndex: number;
  canEdit: boolean;
  animalId: string;
  clinicOptions: ClinicOption[];
  initialValues: TreatmentModalInitialValues;
}

export async function TreatmentCard({
  treatment,
  treatmentIndex,
  canEdit,
  animalId,
  clinicOptions,
  initialValues,
}: TreatmentCardProps) {
  const t = await getTranslations('historypage');
  const startLabel =
    formatDate(treatment.startDate) ?? t('personal.treatments_unknown_date');
  const endLabel = treatment.endDate
    ? formatDate(treatment.endDate) ?? ''
    : '' /* t('personal.treatments_in_progress') */;
  const interventions = treatment.interventions ?? [];
  const medications = treatment.medications ?? [];

  const summaryNode = (
    <p className="text-sm font-semibold text-rose-600">
      {t('personal.treatments_complaints', {
        complaints: treatment.complaints,
      })}
    </p>
  );

  const detailsNode = (
    <div className="space-y-4 text-sm text-slate-600">
      {interventions.length > 0 && (
        <div>
          <p className="mb-1 font-semibold text-slate-900">
            {t('personal.treatments_interventions')}
          </p>
          <ul className="space-y-1 list-disc pl-5">
            {interventions.map((entry, index) => (
              <li key={`intervention-${index}`}>
                {entry.date && <span>{formatDate(entry.date)}:</span>}{' '}
                <span>{entry.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {medications.length > 0 && (
        <div>
          <p className="mb-1 font-semibold text-slate-900">
            {t('personal.treatments_medications')}
          </p>
          <ul className="space-y-1 list-disc pl-5">
            {medications.map((entry, index) => {
              const start =
                formatDate(entry.startDate) ??
                t('personal.treatments_unknown_date');
              const end = entry.endDate
                ? formatDate(entry.endDate) ?? t('personal.treatments_unknown_date')
                : t('personal.treatments_in_progress');

              return (
                <li key={`medication-${index}`}>
                  <span>
                    {t('personal.treatments_start_end_label', { start, end })}:
                  </span>
                  <span>{entry.name}</span>
                  {entry.dosage && <span> - {entry.dosage}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {treatment.summary && <p>{treatment.summary}</p>}
    </div>
  );

  const titleNode = (
    <div className="flex items-center gap-3">
      <div className="flex-1 flex text-sm flex gap-2">
        <span className="font-semibold text-slate-900">
          {t('personal.treatments_start_label', { date: startLabel })}
        </span>
        <span className="border-l border-slate-300"></span>
        <span
          className={clsx({
            'text-slate-400': !treatment.endDate,
            'text-slate-900 font-semibold': treatment.endDate,
          })}
        >
          {t('personal.treatments_end_label', { date: endLabel })}
        </span>
      </div>

      {canEdit && (
        <div className="shrink-0">
          <EditTreatment
            animalId={animalId}
            clinicOptions={clinicOptions}
            initialValues={initialValues}
            treatmentIndex={treatmentIndex}
          />
        </div>
      )}
    </div>
  );

  return (
    <AccordionItem
      title={titleNode}
      summary={summaryNode}
      details={detailsNode}
    />
  );
}
