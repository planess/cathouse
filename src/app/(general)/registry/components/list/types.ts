import type { AnimalStatus } from '@app/models/animal';

export type RegistryAnimalMapRecord = {
  id: string;
  detailsHref: string;
  name: string;
  species: string;
  status: AnimalStatus;
  address: string;
  latitude: number;
  longitude: number;
  observedAt: string | null;
  isSterilized: boolean;
};

export type RegistrySterilizationZone = {
  id: string;
  animalIds: string[];
  latitude: number;
  longitude: number;
  radius: number;
  allSterilized: boolean;
};

export type RegistryPoint = {
  id: string;
  latitude: number;
  longitude: number;
  labelKey: string;
};
