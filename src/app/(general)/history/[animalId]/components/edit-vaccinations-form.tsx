'use client';

import clsx from 'clsx';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import type {
  ClinicOption,
  VaccinationModalInitialValues,
} from '../types';
import { updateVaccinations } from '../server/update-vaccinations';
import { PlusIcon } from './icons';
import { formatDate as formatDisplayDate } from '../../components/card/card.helpers';

export type EditVaccinationsFormHandle = {
  submit: () => Promise<'updated'>;
};

type VaccinationSectionKey = 'parasites' | 'rabies' | 'virus';

type VaccinationListItem = {
  id: string;
  name: string;
  date: string;
  clinic?: string;
  status: 'existing' | 'new';
  isDeleted: boolean;
};

type EditVaccinationsFormProps = {
  animalId: string;
  initialValues: VaccinationModalInitialValues;
  clinicOptions: ClinicOption[];
};

type SwipeableRowProps = {
  item: VaccinationListItem;
  children: ReactNode;
  onToggle: (id: string) => void;
  swipeLabel: string;
};

const SWIPE_THRESHOLD_PX = 40;

const SwipeableRow = ({ item, children, onToggle, swipeLabel }: SwipeableRowProps) => {
  const startXRef = useRef<number | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    startXRef.current = event.clientX;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) {
      return;
    }

    const delta = event.clientX - startXRef.current;
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
      onToggle(item.id);
    }

    startXRef.current = null;
  };

  const handlePointerCancel = () => {
    startXRef.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle(item.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={swipeLabel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900/40"
    >
      {children}
    </div>
  );
};

function generateTempId(section: VaccinationSectionKey) {
  return `${section}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

function hydrateItems(
  section: VaccinationSectionKey,
  entries: { name: string; date: string; clinic?: string }[],
): VaccinationListItem[] {
  return entries.map((entry, index) => ({
    id: `${section}-${index}-${entry.name}-${entry.date}`,
    name: entry.name,
    date: entry.date,
    clinic: entry.clinic,
    status: 'existing',
    isDeleted: false,
  }));
}

function formatDateLabel(value: string) {
  if (!value) {
    return '—';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return formatDisplayDate(parsedDate) ?? value;
}

export const EditVaccinationsForm = forwardRef<
  EditVaccinationsFormHandle,
  EditVaccinationsFormProps
>(({ animalId, initialValues, clinicOptions }, ref) => {
  const t = useTranslations('historypage.personal');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [parasiteItems, setParasiteItems] = useState(() =>
    hydrateItems('parasites', initialValues.parasites ?? []),
  );
  const [rabiesItems, setRabiesItems] = useState(() =>
    hydrateItems('rabies', initialValues.rabies ?? []),
  );
  const [virusItems, setVirusItems] = useState(() =>
    hydrateItems('virus', initialValues.virus ?? []),
  );

  const [parasiteForm, setParasiteForm] = useState({ name: '', date: '' });
  const [rabiesForm, setRabiesForm] = useState({
    name: '',
    date: '',
    clinic: '',
  });
  const [virusForm, setVirusForm] = useState({
    name: '',
    date: '',
    clinic: '',
  });

  const clinicLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    clinicOptions.forEach((option) => map.set(option.value, option.label));
    return map;
  }, [clinicOptions]);

  const toggleItem = useCallback(
    (section: VaccinationSectionKey, id: string) => {
      const updater = (items: VaccinationListItem[]) =>
        items.map((item) =>
          item.id === id ? { ...item, isDeleted: !item.isDeleted } : item,
        );

      if (section === 'parasites') {
        setParasiteItems(updater);
      } else if (section === 'rabies') {
        setRabiesItems(updater);
      } else {
        setVirusItems(updater);
      }
    },
    [],
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const addParasite = useCallback(() => {
    resetError();

    if (!parasiteForm.name.trim() || !parasiteForm.date) {
      setError(t('form.vaccinations_modal.parasites_error'));
      return;
    }

    setParasiteItems((items) => [
      ...items,
      {
        id: generateTempId('parasites'),
        name: parasiteForm.name.trim(),
        date: parasiteForm.date,
        status: 'new',
        isDeleted: false,
      },
    ]);
    setParasiteForm({ name: '', date: '' });
  }, [parasiteForm, resetError, t]);

  const addVaccination = useCallback(
    (section: Extract<VaccinationSectionKey, 'rabies' | 'virus'>) => {
      resetError();

      const formState = section === 'rabies' ? rabiesForm : virusForm;
      const setItems = section === 'rabies' ? setRabiesItems : setVirusItems;
      const setForm = section === 'rabies' ? setRabiesForm : setVirusForm;

      if (!formState.name.trim() || !formState.date || !formState.clinic) {
        setError(t('form.vaccinations_modal.vaccination_error'));
        return;
      }

      setItems((items) => [
        ...items,
        {
          id: generateTempId(section),
          name: formState.name.trim(),
          date: formState.date,
          clinic: formState.clinic,
          status: 'new',
          isDeleted: false,
        },
      ]);

      setForm({ name: '', date: '', clinic: '' });
    },
    [rabiesForm, resetError, t, virusForm],
  );

  const serialize = useCallback(() => {
    const parasites = parasiteItems
      .filter((item) => !item.isDeleted)
      .map((item) => ({
        name: item.name.trim(),
        date: item.date,
      }));

    const rabies = rabiesItems
      .filter((item) => !item.isDeleted)
      .map((item) => ({
        name: item.name.trim(),
        date: item.date,
        clinic: item.clinic ?? '',
      }));

    const virus = virusItems
      .filter((item) => !item.isDeleted)
      .map((item) => ({
        name: item.name.trim(),
        date: item.date,
        clinic: item.clinic ?? '',
      }));

    return { parasites, rabies, virus };
  }, [parasiteItems, rabiesItems, virusItems]);

  const submit = useCallback(async () => {
    const { parasites, rabies, virus } = serialize();

    const hasInvalidRecord = [...parasites, ...rabies, ...virus].some(
      (entry) => !entry.name || !entry.date,
    );

    if (hasInvalidRecord) {
      const message = t('form.vaccinations_modal.validation_error');
      setError(message);
      throw new Error(message);
    }

    const hasInvalidClinic = [...rabies, ...virus].some(
      (entry) => !entry.clinic,
    );

    if (hasInvalidClinic) {
      const message = t('form.vaccinations_modal.validation_clinic');
      setError(message);
      throw new Error(message);
    }

    const payload = new FormData();
    payload.append('animalId', animalId);
    payload.append('parasites', JSON.stringify(parasites));
    payload.append('rabies', JSON.stringify(rabies));
    payload.append('virus', JSON.stringify(virus));

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await updateVaccinations(payload);

      if (!response.success) {
        setError(response.message);
        throw new Error(response.message);
      }

      return 'updated';
    } finally {
      setIsSubmitting(false);
    }
  }, [animalId, serialize, t]);

  useImperativeHandle(ref, () => ({ submit }), [submit]);

  const swipeHint = t('form.vaccinations_modal.swipe_hint');
  const deletedBadge = t('form.vaccinations_modal.deleted_badge');
  const newBadge = t('form.vaccinations_modal.new_badge');

  const renderList = (
    items: VaccinationListItem[],
    section: VaccinationSectionKey,
    emptyLabel: string,
    showClinic: boolean,
  ) => {
    if (!items.length) {
      return <p className="text-sm text-slate-500">{emptyLabel}</p>;
    }

    return (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <SwipeableRow
              item={item}
              onToggle={(id) => toggleItem(section, id)}
              swipeLabel={swipeHint}
            >
              <div
                className={clsx(
                  'rounded-2xl border border-slate-200 bg-white px-3 py-2 transition',
                  {
                    'bg-emerald-50 border-emerald-200':
                      item.status === 'new' && !item.isDeleted,
                    'bg-rose-50 border-rose-200 opacity-70': item.isDeleted,
                  },
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {showClinic && item.clinic && (
                      <p className="text-xs text-slate-500">
                        {clinicLabelMap.get(item.clinic) ?? item.clinic}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-slate-500">
                    {formatDateLabel(item.date)}
                  </span>
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
    );
  };

  const hasClinicOptions = clinicOptions.length > 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">{swipeHint}</p>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <header className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-slate-900">
              {t('form.vaccinations_modal.parasites_title')}
            </p>
            <p className="text-sm text-slate-500">
              {t('form.vaccinations_modal.parasites_description')}
            </p>
          </div>
        </header>

        {renderList(
          parasiteItems,
          'parasites',
          t('form.vaccinations_modal.parasites_empty'),
          false,
        )}

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_minmax(0,160px)_auto]">
          <div>
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="parasite-name"
            >
              {t('form.vaccinations_modal.name_label')}
            </label>
            <input
              id="parasite-name"
              type="text"
              value={parasiteForm.name}
              onChange={(event) => setParasiteForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="parasite-date"
            >
              {t('form.vaccinations_modal.date_label')}
            </label>
            <input
              id="parasite-date"
              type="date"
              value={parasiteForm.date}
              onChange={(event) => setParasiteForm((prev) => ({
                ...prev,
                date: event.target.value,
              }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={addParasite}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
              aria-label={t('form.vaccinations_modal.add_button_label')}
            >
              <PlusIcon />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <header className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-slate-900">
              {t('form.vaccinations_modal.rabies_title')}
            </p>
            <p className="text-sm text-slate-500">
              {t('form.vaccinations_modal.rabies_description')}
            </p>
          </div>
        </header>

        {renderList(
          rabiesItems,
          'rabies',
          t('form.vaccinations_modal.vaccination_empty'),
          true,
        )}

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_minmax(0,160px)_minmax(0,200px)_auto]">
          <div>
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="rabies-name"
            >
              {t('form.vaccinations_modal.name_label')}
            </label>
            <input
              id="rabies-name"
              type="text"
              value={rabiesForm.name}
              onChange={(event) => setRabiesForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="rabies-date"
            >
              {t('form.vaccinations_modal.date_label')}
            </label>
            <input
              id="rabies-date"
              type="date"
              value={rabiesForm.date}
              onChange={(event) => setRabiesForm((prev) => ({
                ...prev,
                date: event.target.value,
              }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="rabies-clinic"
            >
              {t('form.vaccinations_modal.clinic_label')}
            </label>
            <select
              id="rabies-clinic"
              value={rabiesForm.clinic}
              onChange={(event) => setRabiesForm((prev) => ({
                ...prev,
                clinic: event.target.value,
              }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
              disabled={!hasClinicOptions}
            >
              <option value="">
                {hasClinicOptions
                  ? t('form.vaccinations_modal.clinic_placeholder')
                  : t('form.vaccinations_modal.no_clinics')}
              </option>
              {clinicOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={() => addVaccination('rabies')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900 disabled:opacity-60"
              aria-label={t('form.vaccinations_modal.add_button_label')}
              disabled={!hasClinicOptions}
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        {!hasClinicOptions && (
          <p className="mt-2 text-xs text-rose-600">
            {t('form.vaccinations_modal.clinic_required_hint')}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <header className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-slate-900">
              {t('form.vaccinations_modal.virus_title')}
            </p>
            <p className="text-sm text-slate-500">
              {t('form.vaccinations_modal.virus_description')}
            </p>
          </div>
        </header>

        {renderList(
          virusItems,
          'virus',
          t('form.vaccinations_modal.vaccination_empty'),
          true,
        )}

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_minmax(0,160px)_minmax(0,200px)_auto]">
          <div>
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="virus-name"
            >
              {t('form.vaccinations_modal.name_label')}
            </label>
            <input
              id="virus-name"
              type="text"
              value={virusForm.name}
              onChange={(event) => setVirusForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="virus-date"
            >
              {t('form.vaccinations_modal.date_label')}
            </label>
            <input
              id="virus-date"
              type="date"
              value={virusForm.date}
              onChange={(event) => setVirusForm((prev) => ({
                ...prev,
                date: event.target.value,
              }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-900"
              htmlFor="virus-clinic"
            >
              {t('form.vaccinations_modal.clinic_label')}
            </label>
            <select
              id="virus-clinic"
              value={virusForm.clinic}
              onChange={(event) => setVirusForm((prev) => ({
                ...prev,
                clinic: event.target.value,
              }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
              disabled={!hasClinicOptions}
            >
              <option value="">
                {hasClinicOptions
                  ? t('form.vaccinations_modal.clinic_placeholder')
                  : t('form.vaccinations_modal.no_clinics')}
              </option>
              {clinicOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={() => addVaccination('virus')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-900 hover:text-slate-900 disabled:opacity-60"
              aria-label={t('form.vaccinations_modal.add_button_label')}
              disabled={!hasClinicOptions}
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        {!hasClinicOptions && (
          <p className="mt-2 text-xs text-rose-600">
            {t('form.vaccinations_modal.clinic_required_hint')}
          </p>
        )}
      </section>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      {isSubmitting && (
        <p className="text-sm font-medium text-slate-600" aria-live="polite">
          {t('form.vaccinations_modal.saving')}
        </p>
      )}
    </div>
  );
});

EditVaccinationsForm.displayName = 'EditVaccinationsForm';
