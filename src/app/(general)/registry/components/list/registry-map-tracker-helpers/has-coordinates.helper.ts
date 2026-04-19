import type { RegistryAnimalMapRecord } from '../types';
import type { RegistryAnimalMapRecordWithCoordinates } from './types';

export function hasCoordinates(
  animal: RegistryAnimalMapRecord,
): animal is RegistryAnimalMapRecordWithCoordinates {
  return (
    typeof animal.latitude === 'number' &&
    Number.isFinite(animal.latitude) &&
    typeof animal.longitude === 'number' &&
    Number.isFinite(animal.longitude)
  );
}
