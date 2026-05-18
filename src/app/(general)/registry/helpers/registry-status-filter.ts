import { AnimalStatus } from '@app/models/animal';

export const registryStatusFilters = {
  adoption: [AnimalStatus.underTreatment, AnimalStatus.sheltered],
} as const;

export type RegistryStatusFilter = keyof typeof registryStatusFilters;

export function parseRegistryStatusFilter(
  value: string | string[] | null | undefined,
): RegistryStatusFilter | null {
  if (value === 'adoption') {
    return value;
  }

  return null;
}