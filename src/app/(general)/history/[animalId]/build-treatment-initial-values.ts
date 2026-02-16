import { VetTreatmentRecord } from '@app/models/animal';

import { formatInputDate } from './format-input-date';
import { TreatmentModalInitialValues } from './types';

export function buildTreatmentInitialValues(
  treatment: VetTreatmentRecord,
): TreatmentModalInitialValues {
  return {
    complaints: treatment.complaints,
    startDate: formatInputDate(treatment.startDate) ?? '',
    endDate: formatInputDate(treatment.endDate) ?? '',
    summary: treatment.summary ?? '',
    interventions: (treatment.interventions ?? []).map((entry) => ({
      date: formatInputDate(entry.date) ?? '',
      description: entry.description,
      clinic: entry.clinic?.toString(),
    })),
    medications: (treatment.medications ?? []).map((entry) => ({
      name: entry.name,
      dosage: entry.dosage ?? '',
      startDate: formatInputDate(entry.startDate) ?? '',
      endDate: formatInputDate(entry.endDate) ?? '',
      clinic: entry.clinic?.toString(),
    })),
  };
}
