import type { AnimalSpecies, AnimalStatus } from '@app/models/animal';
import type { RegistryStatusFilter } from '@app/(general)/registry/helpers/registry-status-filter';

export interface RegistryLightAnimalRecord {
  id: string;
  name: string;
  description: string | null;
  species: AnimalSpecies;
  age: number | null;
  status: AnimalStatus;
  previewImage: string;
  lastSeenAt: string | null;
  isSterilized: boolean;
  isVaccinated: boolean;
}

export interface RegistryLightAnimalsPage {
  animals: RegistryLightAnimalRecord[];
  hasMore: boolean;
  total: number;
}

export interface RegistryLightAnimalsProps {
  initialPage: RegistryLightAnimalsPage;
  statusFilter: RegistryStatusFilter | null;
}
