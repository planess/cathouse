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
  const sterilizedDate = formatDate(sterilizedRecord?.date);
  const sterilizedLabel = sterilizedRecord ? 'Yes' : 'No';

  return (
    <div className="grid gap-x-3 gap-y-4 grid-cols-2 grid-cols-[minmax(150px,max-content)_1fr] text-sm text-slate-600">
      <span className="font-medium text-sm text-slate-500">Sex</span>
      <span className="font-semibold text-slate-900">
        {formatSexLabel(animal.sex)}
      </span>

      <span className="font-medium text-sm text-slate-500">Chip number</span>
      <span className="font-semibold text-slate-900">
        {animal.chipNumber ?? '—'}
      </span>

      <span className="font-medium text-sm text-slate-500">Sterilized</span>
      <span className="font-semibold text-slate-900">
        {sterilizedLabel}{' '}
        {sterilizedDate && (
          <span className="text-xs font-normal text-slate-500">
            ({sterilizedDate})
          </span>
        )}
      </span>
    </div>
  );
}
