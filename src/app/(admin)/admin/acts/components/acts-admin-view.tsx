'use client';

import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminAdminActsComponentsActsAdminViewIcon01 } from '@app/components/icons/admin-admin-acts-components-acts-admin-view-icon-01';

import {
  ACT_STATUS_LABELS,
  ActsAdminViewProps,
  EquipmentRow,
  VolunteerGroup,
} from '../types/acts-admin-view.types';

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations('adminpage.acts');
  const translatedLabels: Record<string, string> = {
    scheduled: t('statusLabels.scheduled'),
    pending: t('statusLabels.pending'),
    approved: t('statusLabels.approved'),
    rejected: t('statusLabels.rejected'),
  };

  const label =
    translatedLabels[status] ||
    ACT_STATUS_LABELS[status as keyof typeof ACT_STATUS_LABELS] ||
    status;

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
        status === 'approved' &&
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        status === 'pending' &&
          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        status === 'rejected' &&
          'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      )}
    >
      {label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      {type}
    </span>
  );
}

const CONDITION_COLORS: Record<string, string> = {
  new: 'text-emerald-600 dark:text-emerald-400',
  good: 'text-sky-600 dark:text-sky-400',
  fair: 'text-amber-600 dark:text-amber-400',
  poor: 'text-orange-600 dark:text-orange-400',
  broken: 'text-red-600 dark:text-red-400',
};

function EquipmentList({ items }: { items: EquipmentRow[] }) {
  if (items.length === 0) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="space-y-1">
      {items.map((eq, i) => (
        <div
          key={`${eq.itemId}-${i}`}
          className="flex items-center gap-1.5 text-[11px]"
        >
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {eq.itemName}
          </span>
          <span className={CONDITION_COLORS[eq.conditionBefore] ?? ''}>
            {eq.conditionBefore}
          </span>
          <span className="text-slate-400">→</span>
          <span className={CONDITION_COLORS[eq.conditionAfter] ?? ''}>
            {eq.conditionAfter}
          </span>
          {eq.media.length > 0 && (
            <EquipmentMediaCount count={eq.media.length} />
          )}
        </div>
      ))}
    </div>
  );
}

function EquipmentMediaCount({ count }: { count: number }) {
  const t = useTranslations('adminpage.acts');

  return (
    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      {t('equipment.media', { count })}
    </span>
  );
}

function VolunteerSection({ group }: { group: VolunteerGroup }) {
  const t = useTranslations('adminpage.acts');
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
      <button
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-sky-400 to-blue-600 text-sm font-bold text-white">
            {group.volunteerEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {group.volunteerEmail}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('volunteerActsCount', { count: group.acts.length })}
            </p>
          </div>
        </div>
        <AdminAdminActsComponentsActsAdminViewIcon01
          aria-hidden="true"
          className={clsx(
            'h-5 w-5 text-slate-400 transition-transform',
            expanded && 'rotate-180',
          )}
          fill="none"
          viewBox="0 0 24 24"
        />
      </button>

      {expanded && (
        <div className="border-t border-slate-200/70 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-6 py-3">{t('table.type')}</th>
                  <th className="px-6 py-3">{t('table.status')}</th>
                  <th className="px-6 py-3">{t('table.session')}</th>
                  <th className="px-6 py-3">{t('table.managed')}</th>
                  <th className="px-6 py-3">{t('table.animals')}</th>
                  <th className="px-6 py-3">{t('table.documents')}</th>
                  <th className="px-6 py-3">{t('table.equipment')}</th>
                  <th className="px-6 py-3">{t('table.notes')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {group.acts.map((act) => (
                  <tr
                    key={act.id}
                    className={clsx(
                      'transition-colors',
                      act.status === 'approved' &&
                        'bg-emerald-50/60 dark:bg-emerald-950/20',
                      act.status === 'rejected' &&
                        'bg-red-50/60 dark:bg-red-950/20',
                      act.status === 'pending' &&
                        'bg-slate-50/60 dark:bg-slate-900/20',
                    )}
                  >
                    <td className="px-6 py-3">
                      <TypeBadge type={act.typeName} />
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={act.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-slate-500 dark:text-slate-400">
                      {act.sessionStart} - {act.sessionEnd}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-slate-500 dark:text-slate-400">
                      {act.managedByEmail} ({act.managedAt})
                    </td>
                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                      {act.animals.length > 0 ? act.animals.join(', ') : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3">
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
                          act.documents.length > 0
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                        )}
                      >
                        {act.documents.length > 0
                          ? t('table.filesCount', {
                            count: act.documents.length,
                          })
                          : t('table.noFiles')}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <EquipmentList items={act.equipments} />
                    </td>
                    <td className="max-w-xs truncate px-6 py-3 text-slate-500 dark:text-slate-400">
                      {act.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function ActsAdminView({ groups }: ActsAdminViewProps) {
  const t = useTranslations('adminpage.acts');

  const totalActs = groups.reduce((sum, g) => sum + g.acts.length, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('summary', { total: totalActs, volunteers: groups.length })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('totalActs')}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {totalActs}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('volunteers')}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {groups.length}
            </p>
          </div>
        </div>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center dark:border-slate-700 dark:bg-slate-950/40">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <VolunteerSection key={group.volunteerId} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
