'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

import { useModal } from '@app/hooks/use-modal';

import { formatDate as formatDisplayDate } from '../../components/card/card.helpers';
import { createTreatment } from '../server/create-treatment';
import { updateTreatment } from '../server/update-treatment';

import {
  CreateClinicForm,
  type CreateClinicFormHandle,
} from './create-clinic-form';
import { PlusIcon } from './icons';

import type {
  ClinicOption,
  TreatmentInterventionFormValue,
  TreatmentMedicationFormValue,
  TreatmentModalInitialValues,
} from '../types';

export type TreatmentFormHandle = {
  submit: () => Promise<'saved'>;
};

type TreatmentFormProps = {
  animalId: string;
  clinicOptions: ClinicOption[];
  mode: 'create' | 'edit';
  initialValues?: TreatmentModalInitialValues;
  treatmentIndex?: number;
};

type ListItemStatus = 'existing' | 'new';

interface InterventionListItem extends TreatmentInterventionFormValue {
  id: string;
  status: ListItemStatus;
  isDeleted: boolean;
}

interface MedicationListItem extends TreatmentMedicationFormValue {
  id: string;
  status: ListItemStatus;
  isDeleted: boolean;
}

type SwipeableRowProps = {
  itemId: string;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  swipeLabel: string;
};

const SWIPE_THRESHOLD_PX = 40;

const DEFAULT_VALUES: TreatmentModalInitialValues = {
  complaints: '',
  startDate: '',
  endDate: '',
  summary: '',
  interventions: [],
  medications: [],
};

const SwipeableRow = ({
  itemId,
  onToggle,
  children,
  swipeLabel,
}: SwipeableRowProps) => {
  const startXRef = useRef<number | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startXRef.current = event.clientX;
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) {
      return;
    }

    const delta = event.clientX - startXRef.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
      onToggle(itemId);
    }

    startXRef.current = null;
  };

  const handlePointerCancel = () => {
    startXRef.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle(itemId);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={swipeLabel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerLeave={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900/40"
    >
      {children}
    </div>
  );
};

function generateTempId(prefix: string) {
  return `${prefix}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

function hydrateInterventions(
  entries: TreatmentInterventionFormValue[],
): InterventionListItem[] {
  return entries.map((entry, index) => ({
    id: `${entry.date}-${entry.description}-${index}`,
    date: entry.date,
    description: entry.description,
    clinic: entry.clinic ?? '',
    status: 'existing',
    isDeleted: false,
  }));
}

function hydrateMedications(
  entries: TreatmentMedicationFormValue[],
): MedicationListItem[] {
  return entries.map((entry, index) => ({
    id: `${entry.name}-${entry.startDate}-${index}`,
    name: entry.name,
    dosage: entry.dosage ?? '',
    startDate: entry.startDate,
    endDate: entry.endDate ?? '',
    clinic: entry.clinic ?? '',
    status: 'existing',
    isDeleted: false,
  }));
}

function formatDateLabel(value: string) {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return formatDisplayDate(parsed) ?? value;
}

export const TreatmentForm = forwardRef<
  TreatmentFormHandle,
  TreatmentFormProps
>(
  (
    {
      animalId,
      clinicOptions,
      mode,
      initialValues = DEFAULT_VALUES,
      treatmentIndex,
    },
    ref,
  ) => {
    const t = useTranslations('historypage.personal');
    const modal = useModal();
    const clinicModalRef = useRef<CreateClinicFormHandle | null>(null);
    const collator = useMemo(
      () =>
        new Intl.Collator(undefined, { sensitivity: 'accent', numeric: true }),
      [],
    );

    const [complaints, setComplaints] = useState(initialValues.complaints);
    const [startDate, setStartDate] = useState(initialValues.startDate);
    const [endDate, setEndDate] = useState(initialValues.endDate ?? '');
    const [summary, setSummary] = useState(initialValues.summary ?? '');

    const [interventionItems, setInterventionItems] = useState(() =>
      hydrateInterventions(initialValues.interventions),
    );
    const [medicationItems, setMedicationItems] = useState(() =>
      hydrateMedications(initialValues.medications),
    );

    const [interventionForm, setInterventionForm] = useState<
      TreatmentInterventionFormValue & { clinic?: string }
    >({ date: '', description: '', clinic: '' });

    const [medicationForm, setMedicationForm] = useState<
      TreatmentMedicationFormValue & { clinic?: string }
    >({ name: '', dosage: '', startDate: '', endDate: '', clinic: '' });

    const [clinicOptionsState, setClinicOptionsState] = useState(clinicOptions);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      setClinicOptionsState(clinicOptions);
    }, [clinicOptions]);

    const clinicLabelMap = useMemo(() => {
      const map = new Map<string, string>();
      clinicOptionsState.forEach((option) =>
        map.set(option.value, option.label),
      );
      return map;
    }, [clinicOptionsState]);

    const toggleIntervention = useCallback((id: string) => {
      setInterventionItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, isDeleted: !item.isDeleted } : item,
        ),
      );
    }, []);

    const toggleMedication = useCallback((id: string) => {
      setMedicationItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, isDeleted: !item.isDeleted } : item,
        ),
      );
    }, []);

    const handleAddIntervention = useCallback(() => {
      setError(null);

      if (!interventionForm.date || !interventionForm.description.trim()) {
        setError(t('form.treatment_modal.interventions_error'));
        return;
      }

      setInterventionItems((items) => [
        ...items,
        {
          id: generateTempId('intervention'),
          date: interventionForm.date,
          description: interventionForm.description.trim(),
          clinic: interventionForm.clinic ?? '',
          status: 'new',
          isDeleted: false,
        },
      ]);

      setInterventionForm({ date: '', description: '', clinic: '' });
    }, [interventionForm, t]);

    const handleAddMedication = useCallback(() => {
      setError(null);

      if (!medicationForm.name.trim() || !medicationForm.startDate) {
        setError(t('form.treatment_modal.medications_error'));
        return;
      }

      setMedicationItems((items) => [
        ...items,
        {
          id: generateTempId('medication'),
          name: medicationForm.name.trim(),
          dosage: medicationForm.dosage?.trim() ?? '',
          startDate: medicationForm.startDate,
          endDate: medicationForm.endDate ?? '',
          clinic: medicationForm.clinic ?? '',
          status: 'new',
          isDeleted: false,
        },
      ]);

      setMedicationForm({
        name: '',
        dosage: '',
        startDate: '',
        endDate: '',
        clinic: '',
      });
    }, [medicationForm, t]);

    const handleCreateClinic = useCallback(
      async (onSelect?: (value: string) => void) => {
        clinicModalRef.current = null;

        const result = await modal.showModal<ClinicOption>({
          title: t('form.clinic_modal.title'),
          description: t('form.clinic_modal.description'),
          content: () => <CreateClinicForm ref={clinicModalRef} />,
          dismissible: false,
          size: 'lg',
          actions: [
            { label: t('form.cancel'), value: null },
            {
              label: t('form.submit'),
              tone: 'primary',
              onSelect: () => {
                if (!clinicModalRef.current) {
                  throw new Error('Clinic form is not ready yet.');
                }

                return clinicModalRef.current.submit();
              },
            },
          ],
        });

        if (result) {
          setClinicOptionsState((previous) => {
            if (previous.some((option) => option.value === result.value)) {
              return previous;
            }

            return [...previous, result].sort((a, b) =>
              collator.compare(a.label, b.label),
            );
          });
          onSelect?.(result.value);
        }
      },
      [collator, modal, t],
    );

    const serializeInterventions = useCallback(() => {
      return interventionItems
        .filter((item) => !item.isDeleted)
        .map((item) => ({
          date: item.date,
          description: item.description,
          clinic: item.clinic ?? '',
        }));
    }, [interventionItems]);

    const serializeMedications = useCallback(() => {
      return medicationItems
        .filter((item) => !item.isDeleted)
        .map((item) => ({
          name: item.name,
          dosage: item.dosage ?? '',
          startDate: item.startDate,
          endDate: item.endDate ?? '',
          clinic: item.clinic ?? '',
        }));
    }, [medicationItems]);

    const submit = useCallback(async () => {
      setError(null);

      if (!complaints.trim()) {
        const message = t('form.treatment_modal.complaints_error');
        setError(message);
        throw new Error(message);
      }

      if (!startDate) {
        const message = t('form.treatment_modal.start_date_error');
        setError(message);
        throw new Error(message);
      }

      if (endDate && endDate < startDate) {
        const message = t('form.treatment_modal.end_date_error');
        setError(message);
        throw new Error(message);
      }

      const interventions = serializeInterventions();
      const medications = serializeMedications();

      const hasInvalidIntervention = interventions.some(
        (entry) => !entry.date || !entry.description.trim(),
      );

      const hasInvalidMedication = medications.some(
        (entry) => !entry.name.trim() || !entry.startDate,
      );

      if (hasInvalidIntervention || hasInvalidMedication) {
        const message = t('form.treatment_modal.validation_error');
        setError(message);
        throw new Error(message);
      }

      const payload = new FormData();
      payload.append('animalId', animalId);
      payload.append('complaints', complaints.trim());
      payload.append('startDate', startDate);

      if (endDate) {
        payload.append('endDate', endDate);
      }

      if (summary.trim()) {
        payload.append('summary', summary.trim());
      }

      payload.append('interventions', JSON.stringify(interventions));
      payload.append('medications', JSON.stringify(medications));

      if (mode === 'edit') {
        if (typeof treatmentIndex !== 'number') {
          throw new Error('Treatment identifier is missing.');
        }

        payload.append('treatmentIndex', String(treatmentIndex));
      }

      setIsSubmitting(true);

      try {
        const response =
          mode === 'create'
            ? await createTreatment(payload)
            : await updateTreatment(payload);

        if (!response.success) {
          setError(response.message);
          throw new Error(response.message);
        }

        return 'saved';
      } finally {
        setIsSubmitting(false);
      }
    }, [
      animalId,
      complaints,
      endDate,
      mode,
      serializeInterventions,
      serializeMedications,
      startDate,
      summary,
      t,
      treatmentIndex,
    ]);

    useImperativeHandle(ref, () => ({ submit }), [submit]);

    const swipeHint = t('form.treatment_modal.swipe_hint');
    const deletedBadge = t('form.treatment_modal.deleted_badge');
    const newBadge = t('form.vaccinations_modal.new_badge');

    const hasClinicOptions = clinicOptionsState.length > 0;

    const formTitle =
      mode === 'create'
        ? t('form.treatment_modal.title_create')
        : t('form.treatment_modal.title_edit');

    return (
      <div className="space-y-6">
        <p className="text-base font-semibold text-slate-900">{formTitle}</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="treatment-complaints"
            >
              {t('form.treatment_modal.complaints_label')}
            </label>
            <textarea
              id="treatment-complaints"
              value={complaints}
              onChange={(event) => setComplaints(event.target.value)}
              rows={3}
              placeholder={t('form.treatment_modal.complaints_placeholder')}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-900"
                htmlFor="treatment-start"
              >
                {t('form.treatment_modal.start_date_label')}
              </label>
              <input
                id="treatment-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-900"
                htmlFor="treatment-end"
              >
                {t('form.treatment_modal.end_date_label')}
              </label>
              <input
                id="treatment-end"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <p className="text-xs text-slate-500">
                {t('form.treatment_modal.end_date_hint')}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600">{swipeHint}</p>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <header>
            <p className="text-base font-semibold text-slate-900">
              {t('form.treatment_modal.interventions_title')}
            </p>
            <p className="text-sm text-slate-500">
              {t('form.treatment_modal.interventions_description')}
            </p>
          </header>

          {interventionItems.length === 0 ? (
            <p className="text-sm text-slate-500">
              {t('form.treatment_modal.interventions_empty')}
            </p>
          ) : (
            <ul className="space-y-1">
              {interventionItems.map((item) => (
                <li key={item.id}>
                  <SwipeableRow
                    itemId={item.id}
                    onToggle={toggleIntervention}
                    swipeLabel={swipeHint}
                  >
                    <div
                      className={clsx(
                        'rounded-2xl border bg-white px-3 py-2 transition',
                        {
                          'border-emerald-200 bg-emerald-50':
                            item.status === 'new' && !item.isDeleted,
                          'border-rose-200 bg-rose-50 opacity-70':
                            item.isDeleted,
                          'border-slate-200':
                            item.status === 'existing' && !item.isDeleted,
                        },
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatDateLabel(item.date)}
                        </span>
                        <span className="text-xs">({item.description})</span>
                        <span className="flex-1" />
                        {item.clinic && (
                          <span className="flex-none flex gap-3">
                            <span className="border-l border-slate-300"></span>
                            <span className="text-slate-500">
                              {clinicLabelMap.get(item.clinic) ?? item.clinic}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex gap-3 text-xs font-semibold uppercase">
                        {item.isDeleted && (
                          <span className="text-rose-600">{deletedBadge}</span>
                        )}
                        {item.status === 'new' && !item.isDeleted && (
                          <span className="text-emerald-600">{newBadge}</span>
                        )}
                      </div>
                    </div>
                  </SwipeableRow>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-x-3 gap-y-2 grid-cols-[minmax(100px,40%)_1fr_auto]">
            <div className="flex flex-col gap-2">
              <div>
                <label
                  className="text-sm font-medium text-slate-900"
                  htmlFor="intervention-date"
                >
                  {t('form.treatment_modal.date_label')}
                </label>
                <input
                  id="intervention-date"
                  type="date"
                  value={interventionForm.date}
                  onChange={(event) =>
                    setInterventionForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium text-slate-900"
                  htmlFor="intervention-clinic"
                >
                  {t('form.treatment_modal.clinic_label')}
                </label>

                <div className="flex gap-2">
                  <div className="flex-auto overflow-x-hidden">
                    <select
                      id="intervention-clinic"
                      value={interventionForm.clinic ?? ''}
                      onChange={(event) =>
                        setInterventionForm((prev) => ({
                          ...prev,
                          clinic: event.target.value,
                        }))
                      }
                      className="flex-auto w-full max-w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    >
                      <option value="">
                        {hasClinicOptions
                          ? t('form.treatment_modal.clinic_placeholder')
                          : t('form.treatment_modal.no_clinics')}
                      </option>
                      {clinicOptionsState.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleCreateClinic((value) =>
                        setInterventionForm((prev) => ({
                          ...prev,
                          clinic: value,
                        })),
                      )
                    }
                    className="basis-[32px] shrink-0 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                    aria-label={t('form.clinic_modal.add_label')}
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label
                className="text-sm font-medium text-slate-900"
                htmlFor="intervention-description"
              >
                {t('form.treatment_modal.description_label')}
              </label>
              <textarea
                id="intervention-description"
                rows={4}
                value={interventionForm.description}
                onChange={(event) =>
                  setInterventionForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <button
              type="button"
              onClick={handleAddIntervention}
              className="self-center inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
              aria-label={t('form.treatment_modal.add_button_label')}
            >
              <PlusIcon />
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <header>
            <p className="text-base font-semibold text-slate-900">
              {t('form.treatment_modal.medications_title')}
            </p>
            <p className="text-sm text-slate-500">
              {t('form.treatment_modal.medications_description')}
            </p>
          </header>

          {medicationItems.length === 0 ? (
            <p className="text-sm text-slate-500">
              {t('form.treatment_modal.medications_empty')}
            </p>
          ) : (
            <ul className="space-y-1">
              {medicationItems.map((item) => (
                <li key={item.id}>
                  <SwipeableRow
                    itemId={item.id}
                    onToggle={toggleMedication}
                    swipeLabel={swipeHint}
                  >
                    <div
                      className={clsx(
                        'rounded-2xl border bg-white px-3 py-2 transition',
                        {
                          'border-emerald-200 bg-emerald-50':
                            item.status === 'new' && !item.isDeleted,
                          'border-rose-200 bg-rose-50 opacity-70':
                            item.isDeleted,
                          'border-slate-200':
                            item.status === 'existing' && !item.isDeleted,
                        },
                      )}
                    >
                      <div className="flex items-center gap-3 ">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatDateLabel(item.startDate)} -{' '}
                          {item.endDate
                            ? formatDateLabel(item.endDate)
                            : t('form.treatment_modal.ongoing_label')}
                        </span>
                        <span className="text-xs">
                          ({item.name}
                          {item.dosage && <span> - {item.dosage}</span>})
                        </span>
                        <span className="flex-1" />
                        {item.clinic && (
                          <span className="flex-none flex gap-3">
                            <span className="border-l border-slate-300"></span>
                            <span className="text-slate-500">
                              {clinicLabelMap.get(item.clinic) ?? item.clinic}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex gap-3 text-xs font-semibold uppercase">
                        {item.isDeleted && (
                          <span className="text-rose-600">{deletedBadge}</span>
                        )}
                        {item.status === 'new' && !item.isDeleted && (
                          <span className="text-emerald-600">{newBadge}</span>
                        )}
                      </div>
                    </div>
                  </SwipeableRow>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-x-3 grid-cols-[minmax(100px,40%)_1fr_auto]">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col lg:flex-row gap-2 overflow-x-hidden">
                <div>
                  <label
                    className="text-sm font-medium text-slate-900"
                    htmlFor="medication-start"
                  >
                    {t('form.treatment_modal.date_label')}
                  </label>
                  <input
                    id="medication-start"
                    type="date"
                    value={medicationForm.startDate}
                    onChange={(event) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        startDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium text-slate-900"
                    htmlFor="medication-end"
                  >
                    {t('form.treatment_modal.end_date_label')}
                  </label>
                  <input
                    id="medication-end"
                    type="date"
                    value={medicationForm.endDate ?? ''}
                    onChange={(event) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        endDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <div>
                <label
                  className="text-sm font-medium text-slate-900"
                  htmlFor="medication-clinic"
                >
                  {t('form.treatment_modal.clinic_label')}
                </label>

                <div className="flex gap-2">
                  <div className="flex-auto overflow-x-hidden">
                    <select
                      id="medication-clinic"
                      value={medicationForm.clinic ?? ''}
                      onChange={(event) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          clinic: event.target.value,
                        }))
                      }
                      className="flex-auto w-full max-w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    >
                      <option value="">
                        {hasClinicOptions
                          ? t('form.treatment_modal.clinic_placeholder')
                          : t('form.treatment_modal.no_clinics')}
                      </option>
                      {clinicOptionsState.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleCreateClinic((value) =>
                        setMedicationForm((prev) => ({
                          ...prev,
                          clinic: value,
                        })),
                      )
                    }
                    className="basis-[32px] shrink-0 inline-flex items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                    aria-label={t('form.clinic_modal.add_label')}
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div>
                <label
                  className="text-sm font-medium text-slate-900"
                  htmlFor="medication-name"
                >
                  {t('form.treatment_modal.medication_name_label')}
                </label>
                <input
                  id="medication-name"
                  type="text"
                  value={medicationForm.name}
                  onChange={(event) =>
                    setMedicationForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div>
                <label
                  className="text-sm font-medium text-slate-900"
                  htmlFor="medication-dosage"
                >
                  {t('form.treatment_modal.medication_dosage_label')}
                </label>
                <input
                  id="medication-dosage"
                  type="text"
                  value={medicationForm.dosage ?? ''}
                  onChange={(event) =>
                    setMedicationForm((prev) => ({
                      ...prev,
                      dosage: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div className="border-l border-slate-200 pl-2 flex items-center">
              <button
                type="button"
                onClick={handleAddMedication}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                aria-label={t('form.treatment_modal.add_button_label')}
              >
                <PlusIcon />
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-900"
            htmlFor="treatment-summary"
          >
            {t('form.treatment_modal.summary_label')}
          </label>
          <textarea
            id="treatment-summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            placeholder={t('form.treatment_modal.summary_placeholder')}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        {error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {isSubmitting && (
          <p className="text-sm font-medium text-slate-600" aria-live="polite">
            {t('form.treatment_modal.saving')}
          </p>
        )}
      </div>
    );
  },
);

TreatmentForm.displayName = 'TreatmentForm';
