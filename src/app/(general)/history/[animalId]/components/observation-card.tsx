import type { AnimalObservation } from '@app/models/animal';
import Image from 'next/image';

import { AccordionItem } from '@app/components/accordion';
import { Rate } from '@app/enum/rate';

import {
  buildMapHref,
  formatDate,
  resolveAnimalImage,
} from '../../components/card/card.helpers';

import { LocationIcon } from './icons';

interface ObservationCardProps {
  observation: AnimalObservation;
}

export function ObservationCard({ observation }: ObservationCardProps) {
  const dateLabel = formatDate(observation.date) ?? 'Unknown date';
  const locationAddress =
    observation.location?.address ?? 'Undisclosed location';
  const attachments = observation.assets?.length ?? 0;
  const healthScore = observation.health;

  const locationLabel = (
    <span className="flex gap-1 items-center">
      <span className="text-sky-500">
        <LocationIcon />
      </span>{' '}
      {locationAddress}
    </span>
  );
  const location = observation.location?.address ? (
    observation.location.coordinates ? (
      <a
        href={buildMapHref(observation.location)}
        target="_blank"
        rel="noreferrer noopener"
        className="text-blue-500"
      >
        {locationLabel}
      </a>
    ) : (
      locationLabel
    )
  ) : null;
  const title = (
    <span className="flex gap-3 text-sm">
      <span className="font-medium text-gray-900">{dateLabel}</span>
      {location && (
        <>
          <span className="border-l border-slate-300"></span>
          <span>{location}</span>
        </>
      )}
    </span>
  );
  const summary = observation.note ? <div>{observation.note}</div> : null;

  const rate =
    healthScore >= 8
      ? Rate.ok
      : healthScore >= 6
        ? Rate.satisfactory
        : healthScore >= 4
          ? Rate.risk
          : healthScore > 0
            ? Rate.danger
            : undefined;
  const imagePreview =
    observation.assets?.map(({ key }) =>
      resolveAnimalImage(key, process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL),
    ) ?? [];
  const previewContent = imagePreview.length ? (
    <div className="flex gap-2">
      {imagePreview.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`${index} preview`}
          width={50}
          height={50}
          className="flex-none object-cover duration-500 ease-out group-hover:scale-[1.02]"
          sizes="50px"
        />
      ))}
    </div>
  ) : null;

  return (
    <AccordionItem
      title={title}
      summary={summary}
      details={previewContent}
      rate={rate}
    />
  );
}
