import type {
  AnimalDocument,
  AnimalObservation,
  ObservationLocation,
} from '@app/models/animal';
import { AnimalSex, AnimalStatus } from '@app/models/animal';

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

export function resolveAnimalImage(
  data: AnimalDocument,
  domain?: string,
): string {
  const sanitizedDomain = domain?.replace(/\/$/, '');
  const key = data.mainAsset?.key ?? placeholderImage;

  if (key && sanitizedDomain) {
    return `${sanitizedDomain}/${key}`;
  }

  return key;
}

export function getAgeLabel(birthday?: Date) {
  if (!birthday) {
    return null;
  }

  const now = new Date();
  if (birthday > now) {
    return null;
  }

  const diff = now.getTime() - birthday.getTime();
  const years = Math.floor(diff / YEAR_IN_MS);
  const months = Math.floor((diff % YEAR_IN_MS) / MONTH_IN_MS);

  if (years > 0 && months > 0) {
    return `${years}y ${months}m`;
  }

  if (years > 0) {
    return `${years}y`;
  }

  if (months > 0) {
    return `${months}m`;
  }

  return 'Just arrived';
}

export function formatSexLabel(sex: AnimalSex) {
  switch (sex) {
    case AnimalSex.male:
      return 'Male';
    case AnimalSex.female:
      return 'Female';
    default:
      return 'Unknown';
  }
}

export function formatLabel(value?: string) {
  if (!value) {
    return 'Unknown';
  }

  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

export function formatDate(date?: Date) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date);
}

export function getLatestLocation(observations?: AnimalObservation[]) {
  if (!observations?.length) {
    return null;
  }

  return (
    [...observations]
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      .find((observation) => observation.location)?.location ?? null
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

export function buildBadges(data: AnimalDocument) {
  const badges: Array<{ label: string; tone: BadgeToneKey }> = [];

  if (data.vetMarkers?.sterilized) {
    badges.push({ label: 'Sterilized', tone: 'success' });
  }

  if (
    data.vetMarkers?.rabiesVaccination?.length ||
    data.vetMarkers?.virusVaccination?.length
  ) {
    badges.push({ label: 'Vaccinated', tone: 'info' });
  }

  const hasActiveTreatment = data.vetTreatments?.some(
    (treatment) => !treatment.endDate,
  );
  const hasCompletedTreatment = data.vetTreatments?.some((treatment) =>
    Boolean(treatment.endDate),
  );

  if (hasActiveTreatment) {
    badges.push({ label: 'Under treatment', tone: 'warning' });
  } else if (hasCompletedTreatment) {
    badges.push({ label: 'Cured', tone: 'success' });
  }

  return badges;
}
