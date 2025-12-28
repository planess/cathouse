import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import type { AnimalDocument } from '@app/models/animal';

import {
  badgeTone,
  buildBadges,
  buildMapHref,
  formatDate,
  formatLabel,
  formatSexLabel,
  getAgeLabel,
  getLatestLocation,
  resolveAnimalImage,
  statusTone,
} from './card.helpers';

interface Props {
  data: AnimalDocument;
}

export default function Card({ data }: Props) {
  const src = resolveAnimalImage(data, process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL);

  const ageLabel = getAgeLabel(data.birthday);
  const statusLabel = formatLabel(data.status);
  const sexLabel = formatSexLabel(data.sex);
  const createdAtLabel = formatDate(data.createdAt);
  const latestLocation = getLatestLocation(data.observations);
  const mapHref = latestLocation ? buildMapHref(latestLocation) : null;
  const badges = buildBadges(data);
  const detailsHref = data._id ? `/history/${data._id.toString()}` : null;

  return (
    <article className="group flex flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_25px_80px_rgba(15,23,42,0.08)] transition hover:shadow-[0_35px_100px_rgba(15,23,42,0.12)] md:flex-row md:p-8">
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-100 md:max-w-xs">
        <Image
          src={src}
          alt={`${data.name} preview`}
          width={640}
          height={480}
          className="h-full w-full object-cover duration-500 ease-out group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 320px"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              {formatLabel(data.species)}
            </p>
            {data.status && (
              <span
                className={clsx(
                  'rounded-full px-4 py-1 text-xs font-semibold',
                  statusTone[data.status],
                )}
              >
                {statusLabel}
              </span>
            )}
          </div>

          <h3 className="text-2xl font-semibold text-slate-900 lg:text-3xl">
            {data.name}
          </h3>

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
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
        </header>

        <p className="text-sm leading-relaxed text-slate-600">
          {data.description ??
            'There is no description yet for this animal. Add one to help adopters learn more.'}
        </p>

        <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
          {ageLabel && (
            <div>
              <dt className="font-semibold text-slate-900">Age</dt>
              <dd>{ageLabel}</dd>
            </div>
          )}
          <div>
            <dt className="font-semibold text-slate-900">Sex</dt>
            <dd>{sexLabel}</dd>
          </div>
          {data.chipNumber && (
            <div>
              <dt className="font-semibold text-slate-900">Chip ID</dt>
              <dd>{data.chipNumber}</dd>
            </div>
          )}
          {data.passportCode && (
            <div>
              <dt className="font-semibold text-slate-900">Passport</dt>
              <dd>{data.passportCode}</dd>
            </div>
          )}
        </dl>

        {latestLocation && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Last seen:</span>
            <span>{latestLocation.address}</span>
            {mapHref && (
              <a
                href={mapHref}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sky-700 underline-offset-4 hover:underline"
              >
                Open map
              </a>
            )}
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          {createdAtLabel && <span>Created on {createdAtLabel}</span>}
          {detailsHref && (
            <Link
              href={detailsHref}
              className="inline-flex items-center rounded-full border border-slate-800 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              View profile
            </Link>
          )}
        </footer>
      </div>
    </article>
  );
}
