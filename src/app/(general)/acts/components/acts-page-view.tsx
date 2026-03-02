'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import {
  createVolunteerAct,
  deleteVolunteerAct,
  updateVolunteerAct,
} from '@app/actions/acts.server';
import { CheckboxGroup } from '@app/components/checkbox-group/checkbox-group';
import { RadioGroup } from '@app/components/radio-group/radio-group';

import type {
  ActsPageViewProps,
  EquipmentInput,
  VolunteerActRow,
} from '../types/acts-page.types';

type EquipmentRowState = {
  key: string;
  itemId: string;
  conditionBefore: string;
  conditionAfter: string;
  notes: string;
  mediaInputs: string[];
};

const CONDITION_OPTIONS = ['new', 'good', 'fair', 'poor', 'broken'] as const;

function createEquipmentRow(seed?: EquipmentInput): EquipmentRowState {
  return {
    key: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    itemId: seed?.itemId ?? '',
    conditionBefore: seed?.conditionBefore ?? 'fair',
    conditionAfter: seed?.conditionAfter ?? 'fair',
    notes: seed?.notes ?? '',
    mediaInputs: [`media-${Date.now()}-${Math.random().toString(16).slice(2)}`],
  };
}

function DynamicActForm({
  mode,
  act,
  categories,
  animals,
  equipmentOptions,
  action,
}: {
  mode: 'create' | 'edit';
  act?: VolunteerActRow;
  categories: ActsPageViewProps['categories'];
  animals: ActsPageViewProps['animals'];
  equipmentOptions: ActsPageViewProps['equipmentOptions'];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [equipmentRows, setEquipmentRows] = useState<EquipmentRowState[]>(
    act && act.equipments.length > 0
      ? act.equipments.map((equipment) => createEquipmentRow(equipment))
      : [],
  );

  const selectedAnimalIds = useMemo(
    () => act?.animalIds ?? [],
    [act?.animalIds],
  );
  const typeOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories],
  );
  const animalOptions = useMemo(
    () =>
      animals.map((animal) => ({
        value: animal.id,
        label: animal.name,
      })),
    [animals],
  );

  const addEquipmentRow = () => {
    setEquipmentRows((prev) => [...prev, createEquipmentRow()]);
  };

  const removeEquipmentRow = (key: string) => {
    setEquipmentRows((prev) => {
      return prev.filter((row) => row.key !== key);
    });
  };

  const updateRow = (
    key: string,
    field: 'itemId' | 'conditionBefore' | 'conditionAfter' | 'notes',
    value: string,
  ) => {
    setEquipmentRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    );
  };

  const addMediaInput = (key: string) => {
    setEquipmentRows((prev) =>
      prev.map((row) =>
        row.key === key
          ? {
              ...row,
              mediaInputs: [
                ...row.mediaInputs,
                `media-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              ],
            }
          : row,
      ),
    );
  };

  const t = useTranslations('actspage');

  return (
    <form action={action} className="space-y-5">
      {mode === 'edit' && <input type="hidden" name="actId" value={act?.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('form.type')}</p>
          <RadioGroup
            name="typeId"
            direction="vertical"
            options={typeOptions}
            defaultValue={act?.typeId ?? ''}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t('form.animals')}</p>
          <CheckboxGroup
            name="animalIds"
            direction="vertical"
            options={animalOptions}
            defaultValue={selectedAnimalIds}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('form.sessionStart')}</span>
          <input
            type="datetime-local"
            name="sessionStart"
            required
            defaultValue={act?.sessionStart ?? ''}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span>{t('form.sessionEnd')}</span>
          <input
            type="datetime-local"
            name="sessionEnd"
            defaultValue={act?.sessionEnd ?? ''}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('form.notes')}</span>
        <textarea
          name="notes"
          defaultValue={act?.notes ?? ''}
          rows={4}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <div className="space-y-3 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{t('form.equipment')}</p>
          <button
            type="button"
            onClick={addEquipmentRow}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium"
          >
            {t('form.addEquipment')}
          </button>
        </div>

        <input
          type="hidden"
          name="equipmentCount"
          value={equipmentRows.length}
        />

        {equipmentRows.map((row, index) => (
          <div
            key={row.key}
            className="space-y-3 rounded-lg border border-gray-200 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-gray-500">
                {t('form.equipmentNumber', { number: index + 1 })}
              </p>
              <button
                type="button"
                onClick={() => removeEquipmentRow(row.key)}
                className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700"
              >
                {t('form.remove')}
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">{t('form.selectEquipment')}</p>
              <div className="max-h-36 space-y-1 overflow-y-auto rounded-md border border-gray-200 p-2">
                {equipmentOptions.map((equipment) => (
                  <label
                    key={equipment.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name={`equipmentItemId_${index}`}
                      value={equipment.id}
                      checked={row.itemId === equipment.id}
                      onChange={(event) =>
                        updateRow(row.key, 'itemId', event.target.value)
                      }
                    />
                    <span>{equipment.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span>{t('form.conditionBefore')}</span>
                <select
                  name={`equipmentConditionBefore_${index}`}
                  value={row.conditionBefore}
                  onChange={(event) =>
                    updateRow(row.key, 'conditionBefore', event.target.value)
                  }
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  {CONDITION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {t(`form.conditionOptions.${option}`) ?? option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span>{t('form.conditionAfter')}</span>
                <select
                  name={`equipmentConditionAfter_${index}`}
                  value={row.conditionAfter}
                  onChange={(event) =>
                    updateRow(row.key, 'conditionAfter', event.target.value)
                  }
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  {CONDITION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {t(`form.conditionOptions.${option}`) ?? option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span>{t('form.notesShort')}</span>
              <textarea
                name={`equipmentNotes_${index}`}
                rows={3}
                value={row.notes}
                onChange={(event) =>
                  updateRow(row.key, 'notes', event.target.value)
                }
                className="rounded-md border border-gray-300 px-3 py-2"
              />
            </label>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t('form.mediaAttachments')}
              </p>
              {row.mediaInputs.map((mediaKey) => (
                <input
                  key={mediaKey}
                  type="file"
                  name={`equipmentMedia_${index}`}
                  multiple
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              ))}
              <button
                type="button"
                onClick={() => addMediaInput(row.key)}
                className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium"
              >
                {t('form.addMediaInput')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('form.documentsLabel')}</span>
        <input
          type="file"
          name="documents"
          multiple
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
      >
        {mode === 'create' ? t('form.saveAct') : t('form.saveChanges')}
      </button>
    </form>
  );
}

export function ActsPageView({
  acts,
  categories,
  animals,
  equipmentOptions,
  canCreate,
  canUpdate,
  canDelete,
}: ActsPageViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const t = useTranslations('actspage');

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-sm text-gray-600">{t('subtitle')}</p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreateOpen((prev) => !prev)}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            {t('createButton')}
          </button>
        )}
      </header>

      {canCreate && isCreateOpen ? (
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">{t('createNewAct')}</h2>
          <DynamicActForm
            mode="create"
            action={createVolunteerAct}
            categories={categories}
            animals={animals}
            equipmentOptions={equipmentOptions}
          />
        </section>
      ) : null}

      {!canCreate ? (
        <section className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
          {t('noPermission')}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {t('myActs', { count: acts.length })}
        </h2>

        {acts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
            {t('noActs')}
          </div>
        ) : (
          acts.map((act) => {
            const canEditThisAct =
              canUpdate &&
              (act.status === 'pending' ||
                act.status === 'scheduled' ||
                act.status === 'rejected');

            return (
              <article
                key={act.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{act.typeName}</h3>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    {t('status.' + act.status) ?? act.status}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-600">
                  {t('labels.session')}: {act.sessionStart} - {act.sessionEnd}
                </p>
                <p className="text-sm text-gray-600">
                  {t('labels.animals')}:{' '}
                  {act.animalNames.length > 0
                    ? act.animalNames.join(', ')
                    : t('labels.none')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('labels.notes')}: {act.notes || t('labels.notAvailable')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('labels.documents')}: {act.documentsCount}
                </p>

                {(canUpdate || canDelete) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {canEditThisAct && (
                      <details className="w-full rounded-md border border-gray-200 p-3">
                        <summary className="cursor-pointer text-sm font-medium">
                          {t('editAct')}
                        </summary>
                        <div className="mt-3">
                          <DynamicActForm
                            mode="edit"
                            action={updateVolunteerAct}
                            act={act}
                            categories={categories}
                            animals={animals}
                            equipmentOptions={equipmentOptions}
                          />
                        </div>
                      </details>
                    )}

                    {canUpdate && !canEditThisAct && (
                      <p className="text-xs text-gray-500">
                        {t('messages.approvedCannotUpdate')}
                      </p>
                    )}

                    {canDelete && (
                      <form action={deleteVolunteerAct}>
                        <input type="hidden" name="actId" value={act.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
                        >
                          {t('deleteAct')}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
