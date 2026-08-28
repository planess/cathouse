import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import { ArrowIcon } from '../../../../../(general)/registry/[animalId]/components/icons';

import { EntityCard } from './entity-card';
import { displayValue } from './table-helpers';

import type {
  InventoryEntityRow,
  InventoryItemRow,
} from '../../types/inventory.types';

type ItemRowProps = {
  item: InventoryItemRow;
  isExpanded: boolean;
  expandedRows: Record<string, boolean>;
  onToggleRow: (rowId: string) => void;
  onOpenTransfer: (entity: InventoryEntityRow) => void;
};

export function ItemRow({
  item,
  isExpanded,
  expandedRows,
  onToggleRow,
  onOpenTransfer,
}: ItemRowProps) {
  const t = useTranslations('adminInventory');
  const rowId = `item-${item.id}`;
  const hasEntities = item.entities.length > 0;

  const typeLabel =
    item.type === 'asset'
      ? t('reports.form.typeAsset')
      : t('reports.form.typeConsumable');

  const subtitle =
    item.type === 'asset'
      ? `${typeLabel} • Total: ${item.entityCount}`
      : `${typeLabel} • Total: ${item.totalQuantity} ${
        item.quantityUnit.length > 0
          ? item.quantityUnit
          : t('table.unitsLabel')
      }`;

  return (
    <div className="border-b border-[#e0ebe7]/80 last:border-b-0 dark:border-slate-800">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onToggleRow(rowId)}
          className="flex flex-1 items-center justify-between gap-4 px-6 py-3 text-left text-sm font-medium text-[#0d261e] transition hover:bg-[#edf4f1]/70 disabled:cursor-default disabled:opacity-70 dark:text-slate-100 dark:hover:bg-slate-800/60"
          style={{ fontFamily: '"Plus Jakarta Sans", Inter, sans-serif' }}
          disabled={!hasEntities}
        >
          <span className="flex items-center gap-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              {item.type === 'asset' ? 'A' : 'C'}
            </span>
            <span>
              <span className="block text-sm font-medium text-[#0d261e] dark:text-slate-100">
                {displayValue(item.name)}
              </span>
              <span className="block text-xs text-[#527a6d] dark:text-slate-400">
                {subtitle}
              </span>
            </span>
          </span>
          <span
            className={clsx(
              'inline-flex text-[#527a6d] transition-transform dark:text-slate-300',
              isExpanded ? 'rotate-90' : 'rotate-270',
            )}
          >
            <ArrowIcon />
          </span>
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-4 border-t border-[#e0ebe7]/70 bg-[#f4f8f6] px-6 py-4 dark:border-slate-800 dark:bg-slate-950/30">
          {hasEntities ? (
            item.entities.map((entity) => {
              const historyRowId = `entity-history-${entity.id}`;
              return (
                <EntityCard
                  key={entity.id}
                  entity={entity}
                  isHistoryExpanded={expandedRows[historyRowId] === true}
                  onToggleHistory={() => onToggleRow(historyRowId)}
                  onOpenTransfer={() => onOpenTransfer(entity)}
                />
              );
            })
          ) : (
            <p className="text-xs text-[#527a6d] dark:text-slate-400">
              {t('table.noItems')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
