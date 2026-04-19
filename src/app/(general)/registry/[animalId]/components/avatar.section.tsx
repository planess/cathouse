import clsx from 'clsx';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { AnimalDocument } from '@app/models/animal';

import { formatLabel, statusTone } from '../../components/card/card.helpers';

import EditImage from './edit-image';

interface AvatarProps {
  heroImage: string;
  animal: AnimalDocument;
  canEdit: boolean;
}

export default function AvatarSection({
  heroImage,
  animal,
  canEdit,
}: AvatarProps) {
  const cardTranslations = useTranslations('historypage');
  const statusLabel = formatLabel(animal.status, cardTranslations);
  const nameText = animal.name?.trim() || cardTranslations('card.nameFallback');

  return (
    <div className="relative overflow-hidden rounded-lg bg-slate-100 shadow-[0_0_8px_rgba(0,0,0,0.1)]">
      <Image
        src={heroImage}
        alt={`${nameText} preview`}
        width={640}
        height={640}
        className="h-full w-full object-cover"
        sizes="(max-width: 768px) 100vw, 420px"
      />

      {animal.status !== 'unknown' && (
        <span
          className={clsx(
            'absolute left-4 top-4 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide',
            statusTone[animal.status],
          )}
        >
          {statusLabel}
        </span>
      )}

      {canEdit && (
        <div className="absolute right-4 top-4">
          <EditImage animalId={animal._id?.toString() ?? ''} />
        </div>
      )}
    </div>
  );
}
