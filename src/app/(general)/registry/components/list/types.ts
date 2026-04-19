import type { AnimalDocument, AnimalStatus } from '@app/models/animal';

export type RegistryAnimalMapRecord = {
  id: string;
  detailsHref: string;
  previewImage: string;
  name: string;
  sex: AnimalDocument['sex'];
  birthday: string | null;
  status: AnimalStatus;
  address: string;
  latitude: number | null;
  longitude: number | null;
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
