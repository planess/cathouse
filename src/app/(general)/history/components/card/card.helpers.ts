import { DateTime } from 'luxon';

import type {
  AnimalDocument,
  AnimalObservation,
  ObservationLocation,
} from '@app/models/animal';
import { AnimalSex, AnimalStatus } from '@app/models/animal';

type ClientTranslateFn = ReturnType<typeof import('next-intl').useTranslations>;
type ServerTranslateFn = Awaited<
  ReturnType<typeof import('next-intl/server').getTranslations>
>;
type TranslateFn = ClientTranslateFn | ServerTranslateFn;

export const placeholderImage = 'animals/empty-placeholder.jpg';

export const statusTone: Record<AnimalStatus, string> = {
  [AnimalStatus.free]: 'bg-emerald-100 text-emerald-800',
  [AnimalStatus.underTreatment]: 'bg-amber-100 text-amber-800',
  [AnimalStatus.sheltered]: 'bg-sky-100 text-sky-800',
  [AnimalStatus.returned]: 'bg-lime-100 text-lime-800',
  [AnimalStatus.adopted]:
    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  [AnimalStatus.dead]: 'bg-slate-200 text-slate-700',
  [AnimalStatus.unknown]: 'bg-slate-100 text-slate-600',
};

export const badgeTone = {
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-sky-100 text-sky-800',
} as const;

type BadgeToneKey = keyof typeof badgeTone;

const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365.25;
const MONTH_IN_MS = YEAR_IN_MS / 12;
const DAY_IN_MS = 1000 * 60 * 60 * 24;

const ageUnitKeyMap = {
  year: 'age.year',
  month: 'age.month',
  day: 'age.day',
} as const;

const ageFallbackLabels = {
  year: { singular: 'year', plural: 'years' },
  month: { singular: 'month', plural: 'months' },
  day: { singular: 'day', plural: 'days' },
} as const;

type AgeUnit = keyof typeof ageUnitKeyMap;

function formatAgePart(value: number, unit: AgeUnit, t?: TranslateFn) {
  if (!value) {
    return null;
  }

  if (t) {
    return t(ageUnitKeyMap[unit], { count: value });
  }

  const fallback = ageFallbackLabels[unit];
  const unitLabel = value === 1 ? fallback.singular : fallback.plural;

  return `${value} ${unitLabel}`;
}

export function resolveAnimalImage(url?: string, domain?: string): string {
  const sanitizedDomain = domain?.replace(/\/$/, '');
  const key = url ?? placeholderImage;

  if (key && sanitizedDomain) {
    return `${sanitizedDomain}/${key}`;
  }

  return key;
}

export function getAgeLabel(birthday?: Date, t?: TranslateFn): string {
  if (!birthday) {
    return t?.('age.unknown') ?? 'Unknown age';
  }

  const now = new Date();
  if (birthday > now) {
    return t?.('age.unborn') ?? 'Not born yet';
  }

  const diff = now.getTime() - birthday.getTime();
  const years = Math.floor(diff / YEAR_IN_MS);
  const remainderAfterYears = diff - years * YEAR_IN_MS;
  const months = Math.floor(remainderAfterYears / MONTH_IN_MS);
  const remainderAfterMonths = remainderAfterYears - months * MONTH_IN_MS;
  const days = Math.floor(remainderAfterMonths / DAY_IN_MS);

  const parts = [
    formatAgePart(years, 'year', t),
    formatAgePart(months, 'month', t),
    formatAgePart(days, 'day', t),
  ].filter(Boolean) as string[];

  if (!parts.length) {
    return t?.('age.recent') ?? 'Born recently';
  }

  const value = parts[0];
  return t?.('age.oldSuffix', { value }) ?? `${value} old`;
}

export function formatSexLabel(sex: AnimalSex, t?: TranslateFn) {
  switch (sex) {
    case AnimalSex.male:
      return t?.('sex.male') ?? 'Male';
    case AnimalSex.female:
      return t?.('sex.female') ?? 'Female';
    default:
      return t?.('labels.unknown') ?? 'Unknown';
  }
}

export function formatLabel(value?: string, t?: TranslateFn) {
  if (!value) {
    return t?.('card.labels.unknown') ?? 'Unknown';
  }

  return (
    t?.(`personal.status.${value.replaceAll(/[\s_-]+/g, '-').toLowerCase()}`) ??
    value
  );
}

export function formatDate(date?: Date) {
  if (!date) {
    return null;
  }

  return DateTime.fromJSDate(date)
    .setLocale('uk')
    .toLocaleString(DateTime.DATE_FULL);
}

export function getLatestObservation(
  observations?: AnimalObservation[],
): AnimalObservation | null {
  if (!observations?.length) {
    return null;
  }

  return (
    [...observations]
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      .find((observation) => observation.location) ?? null
  );
}

export function buildMapHref(location: ObservationLocation) {
  const latitude = location.coordinates?.latitude;
  const longitude = location.coordinates?.longitude;

  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  if (location.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
  }

  return null;
}

export function buildBadges(data: AnimalDocument, t?: TranslateFn) {
  const badges: Array<{ label: string; tone: BadgeToneKey }> = [];

  if (data.vetMarkers?.sterilized) {
    badges.push({
      label: t?.('badges.sterilized') ?? 'Sterilized',
      tone: 'success',
    });
  }

  if (
    data.vetMarkers?.rabiesVaccination?.length ||
    data.vetMarkers?.virusVaccination?.length
  ) {
    badges.push({
      label: t?.('badges.vaccinated') ?? 'Vaccinated',
      tone: 'info',
    });
  }

  const hasActiveTreatment = data.vetTreatments?.some(
    (treatment) => !treatment.endDate,
  );
  const hasCompletedTreatment = data.vetTreatments?.some((treatment) =>
    Boolean(treatment.endDate),
  );

  if (hasActiveTreatment) {
    badges.push({
      label: t?.('badges.underTreatment') ?? 'Under treatment',
      tone: 'warning',
    });
  } else if (hasCompletedTreatment) {
    badges.push({
      label: t?.('badges.cured') ?? 'Cured',
      tone: 'success',
    });
  }

  return badges;
}
