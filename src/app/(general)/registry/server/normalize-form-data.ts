import type { AnimalSpecies } from '@app/models/animal';
import { animalSpeciesList, AnimalSex, AnimalStatus } from '@app/models/animal';

export interface ValidatedAnimalPayload {
  name?: string;
  species: AnimalSpecies;
  sex: AnimalSex;
  status: AnimalStatus;
  chipNumber?: string;
  birthday?: Date;
  files: File[];
}

export type SaveAnimalError = { success: false; error: string };
export type ValidationResult =
  | { success: true; data: ValidatedAnimalPayload }
  | SaveAnimalError;

const allowedSpecies = new Set<AnimalSpecies>([...animalSpeciesList]);
const allowedSexes = new Set<AnimalSex>(Object.values(AnimalSex));
const allowedStatuses = new Set<AnimalStatus>(Object.values(AnimalStatus));

export function normalizeFormData(formData: FormData): ValidationResult {
  const name = getString(formData, 'name') ?? undefined;

  const speciesValue = getString(formData, 'species');
  if (!speciesValue || !allowedSpecies.has(speciesValue as AnimalSpecies)) {
    return { success: false, error: 'Species is invalid.' };
  }

  const sexValue = getString(formData, 'sex');
  if (!sexValue || !allowedSexes.has(sexValue as AnimalSex)) {
    return { success: false, error: 'Sex is invalid.' };
  }

  // const birthdayValue = getDate(formData, 'birthdate');
  // if (birthdayValue === 'invalid') {
  //   return { success: false, error: 'Birth date is invalid.' };
  // }
  const statusValue = getString(formData, 'status');
  const status =
    statusValue && allowedStatuses.has(statusValue as AnimalStatus)
      ? (statusValue as AnimalStatus)
      : AnimalStatus.unknown;

  const chipNumber = getString(formData, 'chipid') ?? undefined;

  return {
    success: true,
    data: {
      name,
      species: speciesValue as AnimalSpecies,
      sex: sexValue as AnimalSex,
      status,
      chipNumber,
      files: extractFiles(formData, 'image'),
    },
  };
}

function getString(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}
