'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  createVolunteerAct,
  deleteVolunteerAct,
  updateVolunteerAct,
} from '@app/actions/acts.server';

import DynamicActForm from './dynamic-act-form';

import type { ActsPageViewProps } from '../types/acts-page.types';

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
          <h1 className="text-2xl font-semibold dark:text-zinc-200">
            {t('title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            {t('subtitle')}
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreateOpen((prev) => !prev)}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            {t('createButton')}
          </button>
        )}
      </header>

      {canCreate && isCreateOpen ? (
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#2d3a52] dark:bg-[#1c2636]">
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
        <section className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-[#2d3a52] dark:bg-[#1c2636] dark:text-zinc-300">
          {t('noPermission')}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {t('myActs', { count: acts.length })}
        </h2>

        {acts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600 dark:border-[#2d3a52] dark:bg-[#1c2636] dark:text-zinc-300">
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
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#2d3a52] dark:bg-[#1c2636]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold dark:text-zinc-100">
                    {act.typeName}
                  </h3>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-[#253247] dark:text-zinc-200">
                    {t('status.' + act.status) ?? act.status}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300">
                  {t('labels.session')}: {act.sessionStart} - {act.sessionEnd}
                </p>
                {act.animalIds?.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    {t('labels.animals')}: {act.animalNames.join(', ')}
                  </p>
                )}
                {act.notes?.length > 0 && (
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    {t('labels.notes')}: {act.notes}
                  </p>
                )}
                {act.documentsCount > 0 && (
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    {t('labels.documents')}: {act.documentsCount}
                  </p>
                )}

                {(canUpdate || canDelete) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {canEditThisAct && (
                      <details className="w-full rounded-md border border-gray-200 p-3 dark:border-[#2d3a52] dark:bg-[#111827]">
                        <summary className="cursor-pointer text-sm font-medium dark:text-zinc-200">
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
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {t('messages.approvedCannotUpdate')}
                      </p>
                    )}

                    {canDelete && (
                      <form action={deleteVolunteerAct}>
                        <input type="hidden" name="actId" value={act.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-700/40 dark:text-red-400"
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
