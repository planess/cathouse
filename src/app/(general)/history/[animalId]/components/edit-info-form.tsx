'use client';

import { useTranslations } from 'next-intl';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useModal } from '@app/hooks/use-modal';

import { updateAnimalInfo } from '../server/update-animal-info';
import {
  animalStatusValues,
  type AnimalStatusValue,
  type ClinicOption,
  type EditInfoInitialValues,
  type InformatorOption,
} from '../types';

import {
  CreateClinicForm,
  type CreateClinicFormHandle,
} from './create-clinic-form';
import {
  CreateInformatorForm,
  type CreateInformatorFormHandle,
} from './create-informator-form';
import { PlusIcon } from './icons';

export type EditInfoFormHandle = {
  submit: () => Promise<'updated'>;
};

type EditInfoFormProps = {
  animalId: string;
  initialValues: EditInfoInitialValues;
  informatorOptions: InformatorOption[];
  clinicOptions: ClinicOption[];
};

export const EditInfoForm = forwardRef<EditInfoFormHandle, EditInfoFormProps>(
  ({ animalId, initialValues, informatorOptions, clinicOptions }, ref) => {
    const t = useTranslations('historypage.personal');
    const modal = useModal();
    const informatorFormRef = useRef<CreateInformatorFormHandle | null>(null);
    const clinicFormRef = useRef<CreateClinicFormHandle | null>(null);
    const collator = useMemo(
      () => new Intl.Collator(undefined, { sensitivity: 'accent', numeric: true }),
      [],
    );

    const [name, setName] = useState(initialValues.name);
    const [birthday, setBirthday] = useState(initialValues.birthday ?? '');
    const [description, setDescription] = useState(initialValues.description ?? '');
    const [passportCode, setPassportCode] = useState(initialValues.passportCode ?? '');
    const [chipNumber, setChipNumber] = useState(initialValues.chipNumber ?? '');
    const [informator, setInformator] = useState(initialValues.informator ?? '');
    const [status, setStatus] = useState<AnimalStatusValue>(initialValues.status);
    const [informatorOptionsState, setInformatorOptionsState] = useState(
      informatorOptions,
    );
    const [clinicOptionsState, setClinicOptionsState] = useState(clinicOptions);
    const [sterilizedEnabled, setSterilizedEnabled] = useState(Boolean(initialValues.sterilized));
    const [sterilizedDate, setSterilizedDate] = useState(initialValues.sterilized?.date ?? '');
    const [sterilizedMethod, setSterilizedMethod] = useState(
      initialValues.sterilized?.method ?? '',
    );
    const [sterilizedClinic, setSterilizedClinic] = useState(
      initialValues.sterilized?.clinic ?? '',
    );
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statusOptions = useMemo(
      () =>
        animalStatusValues.map((value) => ({
          value,
          label: t(`form.status_options.${value}`),
        })),
      [t],
    );

    const handleAddInformator = useCallback(async () => {
      informatorFormRef.current = null;
      const result = await modal.showModal<InformatorOption>({
        title: t('form.informator_modal.title'),
        description: t('form.informator_modal.description'),
        content: () => <CreateInformatorForm ref={informatorFormRef} />,
        dismissible: false,
        size: 'sm',
        actions: [
          { label: t('form.cancel'), value: void 0 },
          {
            label: t('form.submit'),
            tone: 'primary',
            onSelect: () => {
              if (!informatorFormRef.current) {
                throw new Error('Informator form is not ready yet.');
              }

              return informatorFormRef.current.submit();
            },
          },
        ],
      });

      if (result) {
        setInformatorOptionsState((previous) => {
          if (previous.some((option) => option.value === result.value)) {
            return previous;
          }

          return [...previous, result].sort((a, b) => collator.compare(a.label, b.label));
        });
        setInformator(result.value);
      }
    }, [collator, modal, t]);

    const handleAddClinic = useCallback(async () => {
      clinicFormRef.current = null;
      const result = await modal.showModal<ClinicOption>({
        title: t('form.clinic_modal.title'),
        description: t('form.clinic_modal.description'),
        content: () => <CreateClinicForm ref={clinicFormRef} />,
        dismissible: false,
        size: 'lg',
        actions: [
          { label: t('form.cancel'), value: void 0 },
          {
            label: t('form.submit'),
            tone: 'primary',
            onSelect: () => {
              if (!clinicFormRef.current) {
                throw new Error('Clinic form is not ready yet.');
              }

              return clinicFormRef.current.submit();
            },
          },
        ],
      });

      if (result) {
        setClinicOptionsState((previous) => {
          if (previous.some((option) => option.value === result.value)) {
            return previous;
          }

          return [...previous, result].sort((a, b) => collator.compare(a.label, b.label));
        });
        setSterilizedClinic(result.value);
      }
    }, [collator, modal, t]);

    const hasInformatorOptions = informatorOptionsState.length > 0;
    const hasClinicOptions = clinicOptionsState.length > 0;

    const handleSterilizedToggle = useCallback(() => {
      setSterilizedEnabled((current) => {
        if (current) {
          setSterilizedDate('');
          setSterilizedMethod('');
          setSterilizedClinic('');
        }

        return !current;
      });
    }, []);

    const submit = useCallback<() => Promise<'updated'>>(async () => {
      setError(null);

      if (!name.trim()) {
        const message = t('form.name_error');
        setError(message);
        throw new Error(message);
      }

      if (sterilizedEnabled && !sterilizedDate) {
        const message = t('form.sterilization_date_error');
        setError(message);
        throw new Error(message);
      }

      const payload = new FormData();
      payload.append('animalId', animalId);
      payload.append('name', name.trim());
      payload.append('birthday', birthday);
      payload.append('description', description);
      payload.append('passportCode', passportCode);
      payload.append('chipNumber', chipNumber);
      payload.append('informator', informator);
      payload.append('status', status);
      payload.append('sterilizedEnabled', String(sterilizedEnabled));

      if (sterilizedEnabled) {
        payload.append('sterilizedDate', sterilizedDate);
        payload.append('sterilizedMethod', sterilizedMethod);
        payload.append('sterilizedClinic', sterilizedClinic);
      }

      setIsSubmitting(true);

      try {
        const response = await updateAnimalInfo(payload);

        if (!response.success) {
          setError(response.message);
          throw new Error(response.message);
        }

        return 'updated';
      } finally {
        setIsSubmitting(false);
      }
    }, [
      animalId,
      birthday,
      chipNumber,
      description,
      informator,
      name,
      passportCode,
      status,
      sterilizedClinic,
      sterilizedDate,
      sterilizedEnabled,
      sterilizedMethod,
      t,
    ]);

    useImperativeHandle(ref, () => ({ submit }), [submit]);

    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="animal-name">
              {t('form.name_label')}
            </label>
            <input
              id="animal-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="animal-birthday">
              {t('form.birthday_label')}
            </label>
            <input
              id="animal-birthday"
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900" htmlFor="animal-description">
            {t('form.description_label')}
          </label>
          <textarea
            id="animal-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder={t('form.description_placeholder')}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="animal-passport">
              {t('form.passport_label')}
            </label>
            <input
              id="animal-passport"
              type="text"
              value={passportCode}
              onChange={(event) => setPassportCode(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="animal-chip">
              {t('form.chip_label')}
            </label>
            <input
              id="animal-chip"
              type="text"
              value={chipNumber}
              onChange={(event) => setChipNumber(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="animal-informator">
                {t('form.informator_label')}
              </label>

              <button
                type="button"
                onClick={handleAddInformator}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                aria-label={t('form.informator_add_label')}
                title={t('form.informator_add_label')}
              >
                <PlusIcon />
              </button>
            </div>

            <select
              id="animal-informator"
              value={informator}
              onChange={(event) => setInformator(event.target.value)}
              disabled={!hasInformatorOptions}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
            >
              <option value="">
                {hasInformatorOptions
                  ? t('form.informator_placeholder')
                  : t('form.informator_empty')}
              </option>
              {informatorOptionsState.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">{t('form.informator_hint')}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="animal-status">
              {t('form.status_label')}
            </label>
            <select
              id="animal-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as AnimalStatusValue)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {t('form.sterilization_title')}
              </p>
              <p className="text-xs text-slate-500">
                {t('form.sterilization_description')}
              </p>
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                checked={sterilizedEnabled}
                onChange={handleSterilizedToggle}
              />
              {t('form.sterilization_toggle')}
            </label>
          </div>

          {sterilizedEnabled && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900" htmlFor="sterilization-date">
                    {t('form.sterilization_date_label')}
                  </label>
                  <input
                    id="sterilization-date"
                    type="date"
                    value={sterilizedDate}
                    onChange={(event) => setSterilizedDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900" htmlFor="sterilization-method">
                    {t('form.sterilization_method_label')}
                  </label>
                  <input
                    id="sterilization-method"
                    type="text"
                    value={sterilizedMethod}
                    onChange={(event) => setSterilizedMethod(event.target.value)}
                    placeholder={t('form.sterilization_method_placeholder')}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-900" htmlFor="sterilization-clinic">
                    {t('form.sterilization_clinic_label')}
                  </label>

                  <button
                    type="button"
                    onClick={handleAddClinic}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                    aria-label={t('form.clinic_modal.add_label')}
                    title={t('form.clinic_modal.add_label')}
                  >
                    <PlusIcon />
                  </button>
                </div>

                <select
                  id="sterilization-clinic"
                  value={sterilizedClinic}
                  onChange={(event) => setSterilizedClinic(event.target.value)}
                  disabled={!hasClinicOptions}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                >
                  <option value="">
                    {hasClinicOptions
                      ? t('form.sterilization_clinic_placeholder')
                      : t('form.clinic_modal.empty_label')}
                  </option>
                  {clinicOptionsState.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </section>

        {error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        {isSubmitting && (
          <p className="text-sm font-medium text-slate-600" aria-live="polite">
            {t('form.saving_general')}
          </p>
        )}
      </div>
    );
  },
);

EditInfoForm.displayName = 'EditInfoForm';
