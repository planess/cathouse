import clsx from 'clsx';
import { getTranslations } from 'next-intl/server';
import { headers as httpHeaders } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getUser } from '@app/hooks/get-user';
import type { VetTreatmentRecord } from '@app/models/animal';
import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import { hasPermission } from '@app/services/access-verification.service';

import {
  buildBadges,
  buildMapHref,
  formatDate,
  formatLabel,
  formatSexLabel,
  getAgeLabel,
  getLatestLocation,
  resolveAnimalImage,
  statusTone,
} from '../components/card/card.helpers';

import AddObservation from './components/add-observation';
import AddTreatment from './components/add-treatment';
import Divider from './components/divider';
import EditImage from './components/edit-image';
import EditInfo from './components/edit-info';
import EditVaccinations from './components/edit-vaccinations';
import { EmptyState } from './components/empty-state';
import {
  ArrowIcon,
  ClockIcon,
  EmailIcon,
  PhoneIcon,
  TelegramIcon,
} from './components/icons';
import { ObservationCard } from './components/observation-card';
import PublishButton from './components/publish-button';
import { TreatmentCard } from './components/treatment-card';
import { loadAnimal } from './data';
import { resolveHistoryBackHref } from './resolve-history-back-href';
import { listClinicOptions } from './server/list-clinics';
import { listInformatorOptions } from './server/list-people';
import {
  buildVaccinationGroups,
  sortObservations,
  sortTreatments,
} from './utils';

import type {
  ClinicOption,
  EditInfoInitialValues,
  InformatorOption,
  TreatmentModalInitialValues,
  VaccinationModalInitialValues,
} from './types';

type PageProps = {
  params: {
    animalId: string;
  };
};

function formatInputDate(value?: Date | null) {
  if (!value || Number.isNaN(value.getTime())) {
    return undefined;
  }

  return value.toISOString().slice(0, 10);
}

function buildTreatmentInitialValues(
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

export default async function AnimalHistoryPage({ params }: PageProps) {
  const isVolunteer = await hasPermission(SYSTEM_PERMISSIONS.HISTORY_CREATE);
  const animal = await loadAnimal(params.animalId, Boolean(isVolunteer));

  if (!animal) {
    notFound();
  }

  const user = await getUser();
  const t = await getTranslations('historypage');
  const headers = await httpHeaders();

  const forceEdit = false; // flag for admin override
  const canEdit =
    (isVolunteer && user?.id.toString() === animal.createdBy.toString()) ||
    forceEdit;
  const backHref = resolveHistoryBackHref(headers.get('referer'));
  const heroImage = resolveAnimalImage(
    animal.mainAsset?.key,
    process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL,
  );
  const heroBadges = buildBadges(animal);
  const statusLabel = formatLabel(animal.status);
  const ageLabel = getAgeLabel(animal.birthday);
  const createdLabel = formatDate(animal.createdAt);
  const latestLocation = getLatestLocation(animal.observations);
  const mapHref = latestLocation ? buildMapHref(latestLocation) : null;
  const sortedObservations = sortObservations(animal.observations);
  const vaccinationGroups = buildVaccinationGroups(animal);
  const hasVaccinationRecords = vaccinationGroups.some(
    (group) => group.entries.length > 0,
  );
  const treatments = sortTreatments(animal.vetTreatments);
  const canAddTreatment =
    canEdit && treatments.every((record) => Boolean(record.endDate));
  const sterilizedRecord = animal.vetMarkers?.sterilized;
  const sterilizedDate = formatDate(sterilizedRecord?.date);
  const sterilizedLabel = sterilizedRecord ? 'Yes' : 'No';
  const isDraft = animal.draft;
  let informatorOptions: InformatorOption[] = [];
  let clinicOptions: ClinicOption[] = [];

  if (canEdit) {
    [informatorOptions, clinicOptions] = await Promise.all([
      listInformatorOptions(),
      listClinicOptions(),
    ]);
  }

  const editInfoInitialValues: EditInfoInitialValues = {
    name: animal.name,
    birthday: formatInputDate(animal.birthday),
    description: animal.description ?? '',
    passportCode: animal.passportCode ?? '',
    chipNumber: animal.chipNumber ?? '',
    informator: animal.informator?.toString(),
    status: animal.status as EditInfoInitialValues['status'],
    sterilized: sterilizedRecord
      ? {
          date: formatInputDate(sterilizedRecord.date),
          method: sterilizedRecord.method ?? '',
          clinic: sterilizedRecord.clinic?.toString(),
        }
      : null,
  };

  const editVaccinationsInitialValues: VaccinationModalInitialValues = {
    parasites: (animal.vetMarkers?.parasites ?? []).map((entry) => ({
      name: entry.name,
      date: formatInputDate(entry.date) ?? '',
    })),
    rabies: (animal.vetMarkers?.rabiesVaccination ?? []).map((entry) => ({
      name: entry.name,
      date: formatInputDate(entry.date) ?? '',
      clinic: entry.clinic?.toString() ?? '',
    })),
    virus: (animal.vetMarkers?.virusVaccination ?? []).map((entry) => ({
      name: entry.name,
      date: formatInputDate(entry.date) ?? '',
      clinic: entry.clinic?.toString() ?? '',
    })),
  };

  return (
    <div className="bg-slate-50 px-3 py-4 lg:py-5 mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex justify-between items-center">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowIcon />
          {t('personal.backtohistory')}
        </Link>

        {canEdit && isDraft && (
          <div className="flex gap-4 items-center">
            <PublishButton animalId={animal._id} />
          </div>
        )}
      </div>

      <div className="text-sm text-slate-500 bg-[#F3F4F6] rounded-t-lg">
        <div className="border-t-2 border border-slate-200 rounded-lg bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] p-4 lg:p-6 grid grid-cols-[minmax(0,420px)_1fr] gap-x-6">
          <div>
            <div className="relative overflow-hidden rounded-lg bg-slate-100 shadow-[0_0_8px_rgba(0,0,0,0.1)]">
              <Image
                src={heroImage}
                alt={`${animal.name} preview`}
                width={640}
                height={640}
                className="h-full w-full object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
              />

              {animal.status !== 'unknown' && (
                <span
                  className={clsx(
                    'absolute left-4 top-4 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide',
                    statusTone[animal.status],
                  )}
                >
                  {statusLabel}
                </span>
              )}

              {canEdit && (
                <div className="absolute right-4 top-4">
                  <EditImage animalId={animal._id.toString()} />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
              <a
                href="https://t.me/periphery_foundation?animal=test"
                target="_blank"
                className="flex-1"
              >
                <TelegramIcon />
              </a>

              <a href="tel:+380973959022" className="flex-1" target="_blank">
                <PhoneIcon />
              </a>

              <a
                href="mailto:info@perilines.com.ua"
                className="flex-1"
                target="_blank"
              >
                <EmailIcon />
              </a>
            </div>

            <Divider />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase text-gray-900">
                  {t('personal.observations')}
                </h2>

                {canEdit && (
                  <AddObservation
                    animalId={animal._id.toString()}
                    informatorOptions={informatorOptions}
                  />
                )}
              </div>

              <div className="flex flex-col gap-4">
                {sortedObservations.length === 0 ? (
                  <EmptyState message={t('personal.no_observations') + '.'} />
                ) : (
                  <div className="flex flex-col gap-4">
                    {sortedObservations.map((observation, index) => (
                      <ObservationCard
                        key={`observation-${observation.date?.toISOString() ?? index}`}
                        observation={observation}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
                  {animal.name}
                </h1>
                <div className="text-sm text-slate-600">{ageLabel}</div>
              </div>

              <div className="flex gap-2 items-center">
                <span className="flex gap-2 items-center text-sm bg-slate-100 text-slate-500 rounded-full px-3 py-1">
                  <ClockIcon />{' '}
                  <span>Created: {formatDate(animal.createdAt)}</span>
                </span>
                {canEdit && (
                  <EditInfo
                    animalId={animal._id.toString()}
                    initialValues={editInfoInitialValues}
                    informatorOptions={informatorOptions}
                    clinicOptions={clinicOptions}
                  />
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-base text-slate-600">{animal.description}</p>
            </div>

            <Divider />

            <div className="grid gap-x-3 gap-y-4 grid-cols-2 grid-cols-[minmax(150px,max-content)_1fr] text-sm text-slate-600">
              <span className="font-medium text-sm text-slate-500">Sex</span>
              <span className="font-semibold text-slate-900">
                {formatSexLabel(animal.sex)}
              </span>

              <span className="font-medium text-sm text-slate-500">
                Chip number
              </span>
              <span className="font-semibold text-slate-900">
                {animal.chipNumber ?? '—'}
              </span>

              <span className="font-medium text-sm text-slate-500">
                Sterilized
              </span>
              <span className="font-semibold text-slate-900">
                {sterilizedLabel}{' '}
                {sterilizedDate && (
                  <span className="text-xs font-normal text-slate-500">
                    ({sterilizedDate})
                  </span>
                )}
              </span>
            </div>

            <Divider />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase text-slate-900">
                  {t('personal.vaccinations')}
                </h2>

                {canEdit && (
                  <EditVaccinations
                    animalId={animal._id.toString()}
                    initialValues={editVaccinationsInitialValues}
                    clinicOptions={clinicOptions}
                  />
                )}
              </div>

              {hasVaccinationRecords ? (
                <div className="grid gap-6 md:grid-cols-3">
                  {vaccinationGroups
                    .filter((group) => group.entries.length > 0)
                    .map((group) => (
                      <section key={group.key} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <h4
                            className={clsx(
                              'text-xs font-semibold uppercase text-slate-700 flex gap-2 items-center',
                              group.accent,
                            )}
                          >
                            <span className="text-blue-500">{group.icon}</span>{' '}
                            {group.title}
                          </h4>
                        </div>

                        <ul className="flex flex-col gap-4">
                          {group.entries.map((entry) => (
                            <li key={entry.id} className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-900">
                                {entry.dateLabel ?? '—'}
                              </span>
                              <span className="text-xs text-slate-400">
                                {entry.label || '—'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                </div>
              ) : (
                <EmptyState message={t('personal.vaccinations_empty')} />
              )}
            </div>

            <Divider />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-900">
                  {t('personal.treatments')}
                </h2>

                {canAddTreatment && (
                  <AddTreatment
                    animalId={animal._id.toString()}
                    clinicOptions={clinicOptions}
                  />
                )}
              </div>

              {treatments.length === 0 ? (
                <EmptyState message={t('personal.treatments_empty')} />
              ) : (
                <div className="space-y-3">
                  {treatments.map((treatment, index) => {
                    const initialValues =
                      buildTreatmentInitialValues(treatment);

                    return (
                      <TreatmentCard
                        key={`treatment-${treatment.startDate?.toISOString?.() ?? index}`}
                        treatment={treatment}
                        treatmentIndex={index}
                        canEdit={canEdit}
                        animalId={animal._id.toString()}
                        clinicOptions={clinicOptions}
                        initialValues={initialValues}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-gray-500 px-4 lg:px-6 py-2">
          {t('personal.reference')}: #{animal._id.toString()}
        </div>
      </div>
    </div>
  );
}
