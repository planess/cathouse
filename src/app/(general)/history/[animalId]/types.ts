export type SelectOption = {
  value: string;
  label: string;
};

export type InformatorOption = SelectOption;

export type ClinicOption = SelectOption & {
  address?: string;
};

export const animalStatusValues = [
  'free',
  'under-treatment',
  'sheltered',
  'returned',
  'adopted',
  'dead',
  'unknown',
] as const;

export type AnimalStatusValue = (typeof animalStatusValues)[number];

export type SterilizationFormValue = {
  date?: string;
  method?: string;
  clinic?: string;
};

export type EditInfoInitialValues = {
  name: string;
  birthday?: string;
  description?: string;
  passportCode?: string;
  chipNumber?: string;
  informator?: string;
  status: AnimalStatusValue;
  sterilized?: SterilizationFormValue | null;
};
