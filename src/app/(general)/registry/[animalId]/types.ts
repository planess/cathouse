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

export type ParasiteFormValue = {
  name: string;
  date: string;
};

export type VaccinationFormValue = {
  name: string;
  date: string;
  clinic: string;
};

export type VaccinationModalInitialValues = {
  parasites: ParasiteFormValue[];
  rabies: VaccinationFormValue[];
  virus: VaccinationFormValue[];
};

export type TreatmentInterventionFormValue = {
  date: string;
  description: string;
  clinic?: string;
};

export type TreatmentMedicationFormValue = {
  name: string;
  dosage?: string;
  startDate: string;
  endDate?: string;
  clinic?: string;
};

export type TreatmentModalInitialValues = {
  complaints: string;
  startDate: string;
  endDate?: string;
  summary?: string;
  interventions: TreatmentInterventionFormValue[];
  medications: TreatmentMedicationFormValue[];
};
