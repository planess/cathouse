import clsx from 'clsx';
import { getTranslations } from 'next-intl/server';

import { AnimalDocument } from '@app/models/animal';

import EditVaccinations from './components/edit-vaccinations';
import { EmptyState } from './components/empty-state';
import { formatInputDate } from './format-input-date';
import { ClinicOption, VaccinationModalInitialValues } from './types';
import { buildVaccinationGroups } from './utils';

interface VaccinationSectionProps {
  animal: AnimalDocument;
  canEdit: boolean;
  clinicOptions: ClinicOption[];
}

export default async function VaccinationSection({
  animal,
  canEdit,
  clinicOptions,
}: VaccinationSectionProps) {
  const t = await getTranslations('historypage');

  const vaccinationGroups = buildVaccinationGroups(animal, t);
  const hasVaccinationRecords = vaccinationGroups.some(
    (group) => group.entries.length > 0,
  );

  const editVaccinationsInitialValues: VaccinationModalInitialValues = {
    parasites: (animal.vetMarkers?.parasites ?? []).map((entry) => ({
      name: entry.name,
      date: formatInputDate(entry.date) ?? '',
    })),
    rabies: (animal.vetMarkers?.rabiesVaccination ?? []).map((entry) => ({
      name: entry.name,
      date: formatInputDate(entry.date) ?? '',
      clinic: entry.clinic?.toString() ?? '',
    })),
    virus: (animal.vetMarkers?.virusVaccination ?? []).map((entry) => ({
      name: entry.name,
      date: formatInputDate(entry.date) ?? '',
      clinic: entry.clinic?.toString() ?? '',
    })),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase text-slate-900 dark:text-slate-200">
          {t('personal.vaccinations')}
        </h2>

        {canEdit && (
          <EditVaccinations
            animalId={animal._id?.toString() ?? ''}
            initialValues={editVaccinationsInitialValues}
            clinicOptions={clinicOptions}
          />
        )}
      </div>

      {hasVaccinationRecords ? (
        <div className="grid gap-6 md:grid-cols-3">
          {vaccinationGroups
            .filter((group) => group.entries.length > 0)
            .map((group) => (
              <section key={group.key} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h4
                    className={clsx(
                      'text-xs font-semibold uppercase text-slate-700 flex gap-2 items-center dark:text-slate-300',
                      group.accent,
                    )}
                  >
                    <span className="text-blue-500">{group.icon}</span>{' '}
                    {group.title}
                  </h4>
                </div>

                <ul className="flex flex-col gap-4">
                  {group.entries.map((entry) => (
                    <li key={entry.id} className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                        {entry.dateLabel ?? '—'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-400">
                        {entry.label || '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      ) : (
        <EmptyState message={t('personal.vaccinations_empty')} />
      )}
    </div>
  );
}
