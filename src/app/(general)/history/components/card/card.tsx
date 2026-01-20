import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import type { AnimalDocument } from '@app/models/animal';

import {
  ClockIcon,
  ExternalLinkIcon,
  LocationIcon,
} from '../../[animalId]/components/icons';

import {
  badgeTone,
  buildBadges,
  buildMapHref,
  formatDate,
  formatLabel,
  getAgeLabel,
  getLatestObservation,
  resolveAnimalImage,
  statusTone,
} from './card.helpers';

interface Props {
  data: AnimalDocument;
}

export default function Card({ data }: Props) {
  const t = useTranslations('historypage');
  const cardTranslations = useTranslations('historypage.card');
  const src = resolveAnimalImage(
    data.mainAsset?.key,
    process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL,
  );
  const ageLabel = getAgeLabel(data.birthday, cardTranslations);
  const statusLabel = formatLabel(data.status, t);
  const createdAtLabel = formatDate(data.createdAt);
  const createdAtText = createdAtLabel
    ? cardTranslations('labels.createdOn', { date: createdAtLabel })
    : null;
  const latestObservation = getLatestObservation(data.observations);
  const mapHref = latestObservation?.location
    ? buildMapHref(latestObservation.location)
    : null;
  const badges = buildBadges(data, cardTranslations);
  const detailsHref = data._id ? `/history/${data._id.toString()}` : null;
  const descriptionText =
    data.description ?? cardTranslations('descriptionFallback');

  return (
    <div className="bg-[#f3f4f6] dark:bg-neutral-600 rounded-t-lg">
      <article className="group flex flex-col gap-6 rounded-lg border border-slate-100 bg-white dark:bg-neutral-700 dark:border-neutral-600 p-5 shadow-[0_25px_80px_rgba(15,23,42,0.08)] transition hover:shadow-[0_35px_100px_rgba(15,23,42,0.12)] md:flex-row md:p-8">
        <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100 md:max-w-xs">
          <Image
            src={src}
            alt={`${data.name} preview`}
            width={640}
            height={480}
            className="h-full w-full object-cover duration-500 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 320px"
          />

          {data.status !== 'unknown' && (
            <span
              className={clsx(
                'absolute left-3 top-3 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide',
                statusTone[data.status],
              )}
            >
              {statusLabel}
            </span>
          )}

          {badges.length > 0 && (
            <div className="flex flex-col items-end gap-1 text-xs font-semibold uppercase absolute right-3 top-3">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className={clsx(
                    'rounded-full px-3 py-1',
                    badgeTone[badge.tone],
                  )}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-200">
              {data.name}
            </h3>

            <div className="flex gap-x-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold">
                {cardTranslations('labels.age')}
              </span>
              <span>{ageLabel}</span>
            </div>
          </div>

          <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {descriptionText}
          </div>

          {latestObservation && (
            <div className="flex flex-col py-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="font-semibold">
                {cardTranslations('labels.lastSeen')}
              </div>
              <div className="flex gap-x-2 items-center text-slate-500 dark:text-stone-400">
                <span>
                  <LocationIcon />
                </span>
                <span>{latestObservation.location?.address}</span>
                {mapHref && (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sky-400 underline-offset-4 hover:underline flex items-center gap-1"
                  >
                    <span>{cardTranslations('actions.openMap')}</span>{' '}
                    <span>
                      <ExternalLinkIcon />
                    </span>
                  </a>
                )}
              </div>
              <div className="flex gap-x-2 items-center text-slate-500 dark:text-stone-400">
                <span>
                  <ClockIcon />
                </span>
                <span>
                  {latestObservation.date
                    ? formatDate(latestObservation.date)
                    : ''}
                </span>
              </div>
            </div>
          )}

          {detailsHref && (
            <Link
              href={detailsHref}
              className="inline-flex justify-center items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white dark:text-slate-100 dark:bg-slate-600 dark:hover:bg-slate-700"
            >
              {cardTranslations('actions.viewProfile')}
            </Link>
          )}
        </div>
      </article>

      <div className="flex justify-end text-xs text-slate-500 dark:text-slate-200 py-2 px-4 lg:px-6">
        {createdAtText && <span>{createdAtText}</span>}
      </div>
    </div>
  );
}
