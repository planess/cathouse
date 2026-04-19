import type { RegistryAnimalMapRecord } from '../types';

export type RegistryAnimalMapRecordWithCoordinates = RegistryAnimalMapRecord & {
  latitude: number;
  longitude: number;
};
