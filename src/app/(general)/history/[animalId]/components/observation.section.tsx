import { getTranslations } from 'next-intl/server';

import { AnimalDocument, AnimalObservation } from '@app/models/animal';

import { InformatorOption } from '../types';

import AddObservation from './add-observation';
import { EmptyState } from './empty-state';
import { ObservationCard } from './observation-card';

interface ObservationSectionProps {
  animal: AnimalDocument;
  informatorOptions: InformatorOption[];
  canEdit: boolean;
  sortedObservations: AnimalObservation[];
}

export default async function ObservationSection({
  informatorOptions,
  sortedObservations,
  canEdit,
  animal,
}: ObservationSectionProps) {
  const t = await getTranslations('historypage');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase text-gray-900 dark:text-slate-200 transition-colors">
          {t('personal.observations')}
        </h2>

        {canEdit && (
          <AddObservation
            animalId={animal._id?.toString() ?? ''}
            informatorOptions={informatorOptions}
          />
        )}
      </div>

      <div className="flex flex-col gap-4">
        {sortedObservations.length === 0 ? (
          <EmptyState message={t('personal.no_observations') + '.'} />
        ) : (
          <div className="flex flex-col gap-4">
            {sortedObservations.map((observation, index) => (
              <ObservationCard
                key={`observation-${observation.date?.toISOString() ?? index}`}
                observation={observation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
