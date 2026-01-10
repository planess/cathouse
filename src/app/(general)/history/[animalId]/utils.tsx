import { ReactElement } from 'react';

import type {
  AnimalDocument,
  AnimalObservation,
  ParasitesRecord,
  VaccinationRecord,
  VetTreatmentRecord,
} from '@app/models/animal';

import { formatDate } from '../components/card/card.helpers';

import {
  CoronavirusIcon,
  HealingIcon,
  MedicationIcon,
} from './components/icons';

type ClientTranslateFn = ReturnType<typeof import('next-intl').useTranslations>;
type ServerTranslateFn = Awaited<
  ReturnType<typeof import('next-intl/server').getTranslations>
>;
type TranslateFn = ClientTranslateFn | ServerTranslateFn;

export type VaccinationEntry = {
  id: string;
  label: string;
  dateLabel: string | null;
};

export type VaccinationGroup = {
  key: string;
  title: string;
  accent: string;
  icon: ReactElement;
  entries: VaccinationEntry[];
};

export function sortObservations(observations?: AnimalObservation[]) {
  if (!observations?.length) {
    return [] as AnimalObservation[];
  }

  return [...observations].sort(
    (a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0),
  );
}

export function sortTreatments(treatments?: VetTreatmentRecord[]) {
  if (!treatments?.length) {
    return [] as VetTreatmentRecord[];
  }

  return [...treatments].sort(
    (a, b) => (b.startDate?.getTime() ?? 0) - (a.startDate?.getTime() ?? 0),
  );
}

export function buildVaccinationGroups(
  animal: AnimalDocument,
  t: TranslateFn,
): VaccinationGroup[] {
  const rabiesEntries = normalizeVaccinationEntries(
    animal.vetMarkers?.rabiesVaccination,
  );
  const virusEntries = normalizeVaccinationEntries(
    animal.vetMarkers?.virusVaccination,
  );
  const parasiteEntries = normalizeParasiteEntries(
    animal.vetMarkers?.parasites,
  );

  return [
    {
      key: 'rabies',
      title: t('personal.vaccination.rabies'),
      icon: <MedicationIcon />,
      accent: 'text-sky-700',
      entries: rabiesEntries,
    },
    {
      key: 'virus',
      title: t('personal.vaccination.virus'),
      icon: <CoronavirusIcon />,
      accent: 'text-indigo-700',
      entries: virusEntries,
    },
    {
      key: 'dewormed',
      title: t('personal.vaccination.parasites'),
      icon: <HealingIcon />,
      accent: 'text-emerald-700',
      entries: parasiteEntries,
    },
  ];
}

function normalizeVaccinationEntries(
  entries?: VaccinationRecord[],
): VaccinationEntry[] {
  if (!entries?.length) {
    return [];
  }

  return [...entries]
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .map((entry, index) => ({
      id: `${entry.date?.toISOString() ?? 'unknown'}-${entry.name}-${index}`,
      label: entry.name,
      dateLabel: formatDate(entry.date),
    }));
}

function normalizeParasiteEntries(
  entries?: ParasitesRecord[],
): VaccinationEntry[] {
  if (!entries?.length) {
    return [];
  }

  return [...entries]
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .map((entry, index) => ({
      id: `${entry.date?.toISOString() ?? 'unknown'}-${entry.name}-${index}`,
      label: entry.name,
      dateLabel: formatDate(entry.date),
    }));
}
