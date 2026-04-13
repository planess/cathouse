import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { ArrowIcon } from '../../../../../(general)/registry/[animalId]/components/icons';

import { ItemRow } from './item-row';
import { countCategoryRows } from './table-helpers';

import type {
  InventoryEntityRow,
  InventoryTableCategoryNode,
} from '../../types/inventory.types';

type CategoryNodeProps = {
  node: InventoryTableCategoryNode;
  depth: number;
  expandedRows: Record<string, boolean>;
  onToggleRow: (rowId: string) => void;
  onOpenTransfer: (entity: InventoryEntityRow) => void;
};

export function CategoryNode({
  node,
  depth,
  expandedRows,
  onToggleRow,
  onOpenTransfer,
}: CategoryNodeProps) {
  const t = useTranslations('adminInventory');
  const rowId = `category-${node.id}`;
  const isExpanded = expandedRows[rowId] === true;

  const hasChildren = node.children.length > 0;
  const hasItems = node.items.length > 0;
  const hasContent = hasChildren || hasItems;
  const itemCount = countCategoryRows(node);

  return (
    <div
      className="overflow-hidden rounded-xl border border-[#e0ebe7] bg-[#f9fbfa] dark:border-slate-800 dark:bg-slate-950"
      style={{ marginLeft: `${depth * 12}px` }}
    >
      <button
        type="button"
        onClick={() => onToggleRow(rowId)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-lg font-semibold text-[#0d261e] transition-colors hover:bg-[#edf4f1] dark:text-slate-100 dark:hover:bg-slate-900/50"
        style={{ fontFamily: '"Plus Jakarta Sans", Inter, sans-serif' }}
        disabled={!hasContent}
      >
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300">
            {node.name}
          </span>
          <span className="text-xs text-[#527a6d] dark:text-slate-400">
            {t('table.categoryCount', {
              count: itemCount,
            })}
          </span>
        </span>
        <span className="text-xs font-semibold text-[#527a6d] dark:text-slate-300">
          <span
            className={clsx(
              'inline-flex transition-transform',
              isExpanded ? 'rotate-90' : 'rotate-270',
            )}
          >
            <ArrowIcon />
          </span>
        </span>
      </button>
      {isExpanded ? (
        <div className="border-t border-[#e0ebe7]/70 dark:border-slate-800">
          {hasItems && (
            <div>
              {node.items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  isExpanded={expandedRows[`item-${item.id}`] === true}
                  expandedRows={expandedRows}
                  onToggleRow={onToggleRow}
                  onOpenTransfer={onOpenTransfer}
                />
              ))}
            </div>
          )}
          {hasChildren && (
            <div className="space-y-3 p-3">
              {node.children.map((child) => (
                <CategoryNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  expandedRows={expandedRows}
                  onToggleRow={onToggleRow}
                  onOpenTransfer={onOpenTransfer}
                />
              ))}
            </div>
          )}
          {!hasContent && (
            <p className="px-6 py-4 text-xs text-[#527a6d] dark:text-slate-400">
              {t('table.noItems')}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
