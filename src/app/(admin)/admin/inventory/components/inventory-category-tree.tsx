'use client';

import type { InventoryCategoryRow } from '../types/inventory.types';
import type { ReactNode } from 'react';

export function CategoryTree({
  rows,
  onEdit,
  onDelete,
  emptyState,
  labels,
}: {
  rows: InventoryCategoryRow[];
  onEdit: (row: InventoryCategoryRow) => void;
  onDelete: (row: InventoryCategoryRow) => void;
  emptyState: ReactNode;
  labels: {
    name: string;
    inherits: string;
    createdAt: string;
    actions: string;
    edit: string;
    delete: string;
  };
}) {
  if (rows.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-500">
        {emptyState}
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        <tr>
          <th className="px-5 py-3">{labels.name}</th>
          <th className="px-5 py-3">{labels.createdAt}</th>
          <th className="px-5 py-3 text-right">{labels.actions}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200/70">
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="px-5 py-4">
              <div
                className="flex items-center gap-2 font-semibold text-slate-800"
                style={{ paddingLeft: `${row.depth * 16}px` }}
              >
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span>{row.name}</span>
              </div>
            </td>
            <td className="px-5 py-4 text-xs text-slate-500">
              {row.createdAt || '-'}
            </td>
            <td className="px-5 py-4 text-right">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:text-sky-500"
                  aria-label={labels.edit}
                >
                  ✎
                </button>
                {!row.hasChildren && (
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:text-rose-500"
                    aria-label={labels.delete}
                  >
                    ✕
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
