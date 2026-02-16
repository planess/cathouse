import { useTranslations } from 'next-intl';

import { AnimalDocument } from '@app/models/animal';
import { Sterilized } from '@app/models/db/sterilized';

import { formatDate, formatSexLabel } from '../../components/card/card.helpers';

interface FeatureSectionProps {
  animal: AnimalDocument;
  sterilizedRecord?: Sterilized;
}

export default function FeatureSection({
  animal,
  sterilizedRecord,
}: FeatureSectionProps) {
  const cardTranslations = useTranslations('historypage.card');
  const sterilizedDate = formatDate(sterilizedRecord?.date);
  const sterilizedLabel = cardTranslations(
    sterilizedRecord ? 'answers.yes' : 'answers.no',
  );

  return (
    <div className="grid gap-x-3 gap-y-4 grid-cols-[minmax(150px,max-content)_1fr] text-sm text-slate-600">
      <span className="font-medium text-sm text-slate-500 dark:text-slate-400 transition-colors">
        {cardTranslations('labels.sex')}
      </span>
      <span className="font-semibold text-slate-900 dark:text-slate-200 transition-colors">
        {formatSexLabel(animal.sex, cardTranslations)}
      </span>

      <span className="font-medium text-sm text-slate-500 dark:text-slate-400 transition-colors">
        {cardTranslations('labels.chip')}
      </span>
      <span className="font-semibold text-slate-900 dark:text-slate-200 transition-colors">
        {animal.chipNumber ?? '—'}
      </span>

      <span className="font-medium text-sm text-slate-500 dark:text-slate-400 transition-colors">
        {cardTranslations('labels.sterilized')}
      </span>
      <span className="font-semibold text-slate-900 dark:text-slate-200 transition-colors">
        {sterilizedLabel}{' '}
        {sterilizedDate && (
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400 transition-colors">
            ({sterilizedDate})
          </span>
        )}
      </span>
    </div>
  );
}
