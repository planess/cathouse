import { ObjectId } from 'mongodb';
import { z } from 'zod';

import type {
  VetInterventionRecord,
  VetMedicineRecord,
  VetTreatmentRecord,
} from '@app/models/animal';
import { TreatmentPayloadError } from './treatment-payload-error';

const MAX_RECORDS_PER_SECTION = 50;

const clinicFieldSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const interventionSchema = z.object({
  date: z.string().trim().min(1, 'Provide the intervention date.'),
  description: z.string().trim().min(1, 'Describe the intervention.'),
  clinic: clinicFieldSchema,
});

const medicationSchema = z.object({
  name: z.string().trim().min(1, 'Provide the medication name.'),
  dosage: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  startDate: z.string().trim().min(1, 'Provide the medication start date.'),
  endDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  clinic: clinicFieldSchema,
});

const payloadSchema = z.object({
  animalId: z.string().trim().min(1, 'Animal identifier is required.'),
  complaints: z.string().trim().min(1, 'Describe the complaints.'),
  startDate: z.string().trim().min(1, 'Provide the treatment start date.'),
  endDate: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  summary: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  interventions: z.array(interventionSchema).max(MAX_RECORDS_PER_SECTION),
  medications: z.array(medicationSchema).max(MAX_RECORDS_PER_SECTION),
});

export type TreatmentPayload = z.infer<typeof payloadSchema>;

function parseJson(input: FormDataEntryValue | null, field: string) {
  const rawValue = input?.toString() ?? '[]';

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      throw new Error();
    }

    return parsed;
  } catch {
    throw new TreatmentPayloadError(`${field} payload is invalid.`);
  }
}

function toDate(value: string, label: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new TreatmentPayloadError(`Invalid ${label}.`);
  }

  return parsed;
}

function toObjectId(value: string | undefined, label: string) {
  if (!value) {
    return undefined;
  }

  if (!ObjectId.isValid(value)) {
    throw new TreatmentPayloadError(`${label} is invalid.`);
  }

  return new ObjectId(value);
}

function normalizeInterventions(
  entries: TreatmentPayload['interventions'],
): VetInterventionRecord[] {
  return entries.map((entry) => {
    const record: VetInterventionRecord = {
      date: toDate(entry.date, 'intervention date'),
      description: entry.description,
    };

    const clinicId = toObjectId(entry.clinic, 'Intervention clinic');
    if (clinicId) {
      record.clinic = clinicId;
    }

    return record;
  });
}

function normalizeMedications(
  entries: TreatmentPayload['medications'],
): VetMedicineRecord[] {
  return entries.map((entry) => {
    const record: VetMedicineRecord = {
      name: entry.name,
      startDate: toDate(entry.startDate, 'medication start date'),
    };

    if (entry.dosage) {
      record.dosage = entry.dosage;
    }

    if (entry.endDate) {
      const endDate = toDate(entry.endDate, 'medication end date');
      record.endDate = endDate;
    }

    const clinicId = toObjectId(entry.clinic, 'Medication clinic');
    if (clinicId) {
      record.clinic = clinicId;
    }

    if (record.endDate && record.endDate.getTime() < record.startDate.getTime()) {
      throw new TreatmentPayloadError(
        'Medication end date cannot be earlier than the start date.',
      );
    }

    return record;
  });
}

export function parseTreatmentFormData(formData: FormData) {
  const interventions = parseJson(formData.get('interventions'), 'Interventions');
  const medications = parseJson(formData.get('medications'), 'Medications');

  const rawPayload: TreatmentPayload = {
    animalId: formData.get('animalId')?.toString() ?? '',
    complaints: formData.get('complaints')?.toString() ?? '',
    startDate: formData.get('startDate')?.toString() ?? '',
    endDate: formData.get('endDate')?.toString(),
    summary: formData.get('summary')?.toString(),
    interventions,
    medications,
  } as TreatmentPayload;

  const parsed = payloadSchema.safeParse(rawPayload);

  if (!parsed.success) {
    throw new TreatmentPayloadError(
      parsed.error.errors[0]?.message ?? 'Invalid payload.',
    );
  }

  if (!ObjectId.isValid(parsed.data.animalId)) {
    throw new TreatmentPayloadError('Animal identifier is invalid.');
  }

  const animalId = new ObjectId(parsed.data.animalId);
  const startDate = toDate(parsed.data.startDate, 'start date');
  const endDate = parsed.data.endDate
    ? toDate(parsed.data.endDate, 'end date')
    : undefined;

  if (endDate && endDate.getTime() < startDate.getTime()) {
    throw new TreatmentPayloadError(
      'Treatment end date cannot be earlier than the start date.',
    );
  }

  const treatment: VetTreatmentRecord = {
    complaints: parsed.data.complaints,
    startDate,
  };

  if (endDate) {
    treatment.endDate = endDate;
  }

  if (parsed.data.summary) {
    treatment.summary = parsed.data.summary;
  }

  const normalizedInterventions = normalizeInterventions(parsed.data.interventions);
  const normalizedMedications = normalizeMedications(parsed.data.medications);

  if (normalizedInterventions.length) {
    treatment.interventions = normalizedInterventions;
  }

  if (normalizedMedications.length) {
    treatment.medications = normalizedMedications;
  }

  return { animalId, treatment };
}
