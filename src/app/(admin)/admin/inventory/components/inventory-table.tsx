'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState, type ReactNode } from 'react';

import type {
  InventoryCategoryNode,
  InventoryReportRow,
} from '../types/inventory.types';

type TableCategoryNode = {
  id: string;
  name: string;
  children: TableCategoryNode[];
  reports: InventoryReportRow[];
  totalCount: number;
};

function buildCategoryTree(
  categories: InventoryCategoryNode[],
  reports: InventoryReportRow[],
  uncategorizedLabel: string,
): TableCategoryNode[] {
  const reportMap = new Map<string, InventoryReportRow[]>();

  reports.forEach((report) => {
    if (
      typeof report.categoryId !== 'string' ||
      report.categoryId.length === 0
    ) {
      return;
    }

    const current = reportMap.get(report.categoryId) ?? [];
    reportMap.set(report.categoryId, [...current, report]);
  });

  const knownCategoryIds = new Set(
    categories.flatMap((category) => collectTreeCategoryIds(category)),
  );

  const mapNode = (node: InventoryCategoryNode): TableCategoryNode => {
    const children = node.children.map(mapNode);
    const nodeReports = reportMap.get(node.id) ?? [];
    const childrenCount = children.reduce(
      (sum, child) => sum + child.totalCount,
      0,
    );

    return {
      id: node.id,
      name: node.name,
      children,
      reports: nodeReports,
      totalCount: nodeReports.length + childrenCount,
    };
  };

  const tree = categories.map(mapNode);

  const uncategorized = reports.filter((report) => {
    const categoryId = report.categoryId;

    return (
      typeof categoryId !== 'string' ||
      categoryId.length === 0 ||
      !knownCategoryIds.has(categoryId)
    );
  });

  if (uncategorized.length > 0) {
    tree.push({
      id: 'uncategorized',
      name: uncategorizedLabel,
      children: [],
      reports: uncategorized,
      totalCount: uncategorized.length,
    });
  }

  return tree;
}

function collectTreeCategoryIds(node: InventoryCategoryNode): string[] {
  return [node.id, ...node.children.flatMap(collectTreeCategoryIds)];
}

export function InventoryTable({
  categories,
  reports,
  onEditReport,
}: {
  categories: InventoryCategoryNode[];
  reports: InventoryReportRow[];
  onEditReport: (report: InventoryReportRow) => void;
}) {
  const t = useTranslations('adminInventory');
  const tree = useMemo(
    () => buildCategoryTree(categories, reports, t('table.uncategorized')),
    [categories, reports, t],
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setExpanded((current) => ({
      ...current,
      [categoryId]: current[categoryId] !== true,
    }));
  };

  const renderReportRow = (report: InventoryReportRow, depth: number) => (
    <tr
      key={report.id}
      className="transition hover:bg-slate-50/70 dark:hover:bg-slate-900/40"
    >
      <td className="px-6 py-4">
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: `${(depth + 1) * 16}px` }}
        >
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          <span className="font-medium text-slate-900 dark:text-white">
            {report.name || '-'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-xs font-mono text-slate-500">
        {report.sku || '-'}
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold text-slate-900 dark:text-white">
          {report.quantity}
        </span>
        <span className="ml-1 text-xs text-slate-400">
          {t('table.unitsLabel')}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
        {report.storageName || '-'}
      </td>
      <td className="px-6 py-4 text-slate-500">
        {report.expirationDate || '-'}
      </td>
      <td className="px-6 py-4 text-slate-500">{report.createdAt || '-'}</td>
      <td className="px-6 py-4 text-slate-500">{report.type || '-'}</td>
      <td className="px-6 py-4 text-right">
        <button
          type="button"
          onClick={() => onEditReport(report)}
          className="rounded-lg p-1.5 text-slate-400 transition hover:text-sky-500"
          aria-label={t('table.editAria', {
            name: report.name,
          })}
        >
          ✎
        </button>
      </td>
    </tr>
  );

  const renderCategoryRows = (
    nodes: TableCategoryNode[],
    depth: number,
  ): ReactNode[] =>
    nodes.flatMap((node) => {
      const isExpanded = expanded[node.id] === true;
      const hasChildren = node.children.length > 0;
      const hasReports = node.reports.length > 0;
      const hasContent = hasChildren || hasReports;

      const rows: ReactNode[] = [
        <tr
          key={`category-${node.id}`}
          className="bg-slate-50/80 dark:bg-slate-900/60"
        >
          <td colSpan={8} className="px-6 py-3">
            <button
              type="button"
              onClick={() => toggleCategory(node.id)}
              className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
              style={{ paddingLeft: `${depth * 16}px` }}
              disabled={!hasContent}
            >
              <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-500">
                {isExpanded ? '-' : '+'}
              </span>
              <span>{node.name}</span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {t('table.categoryCount', {
                  count: node.totalCount,
                })}
              </span>
            </button>
          </td>
        </tr>,
      ];

      if (!isExpanded) {
        return rows;
      }

      if (!hasContent) {
        rows.push(
          <tr key={`empty-${node.id}`}>
            <td colSpan={8} className="px-6 py-4 text-xs text-slate-400">
              {t('table.noItems')}
            </td>
          </tr>,
        );
        return rows;
      }

      rows.push(
        ...node.reports.map((report) => renderReportRow(report, depth)),
      );

      if (hasChildren) {
        rows.push(...renderCategoryRows(node.children, depth + 1));
      }

      return rows;
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-240 text-left text-sm">
        <thead className="bg-slate-50/70 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
          <tr>
            <th className="px-6 py-4">{t('table.columns.name')}</th>
            <th className="px-6 py-4">{t('table.columns.sku')}</th>
            <th className="px-6 py-4">{t('table.columns.quantity')}</th>
            <th className="px-6 py-4">{t('table.columns.storage')}</th>
            <th className="px-6 py-4">{t('table.columns.expiration')}</th>
            <th className="px-6 py-4">{t('table.columns.received')}</th>
            <th className="px-6 py-4">{t('table.columns.source')}</th>
            <th className="px-6 py-4 text-right">
              {t('table.columns.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
          {tree.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-6 py-6 text-center text-sm text-slate-500"
              >
                {t('table.empty')}
              </td>
            </tr>
          ) : (
            renderCategoryRows(tree, 0)
          )}
        </tbody>
      </table>
    </div>
  );
}
