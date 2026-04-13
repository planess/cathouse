import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import {
  ArrowIcon,
  ClockIcon,
  PencilIcon,
  TransferIcon,
} from '../../../../../(general)/history/[animalId]/components/icons';

import {
  buildEntityAmount,
  displayValue,
  entityTitle,
  formatConditionLabel,
  resolveEntityOwner,
} from './table-helpers';
import { TransactionRow } from './transaction-row';

import type { InventoryEntityRow } from '../../types/inventory.types';

type EntityCardProps = {
  entity: InventoryEntityRow;
  isHistoryExpanded: boolean;
  onToggleHistory: () => void;
  onOpenTransfer: () => void;
};

export function EntityCard({
  entity,
  isHistoryExpanded,
  onToggleHistory,
  onOpenTransfer,
}: EntityCardProps) {
  const t = useTranslations('adminInventory');
  const hasTransactions = entity.transactions.length > 0;
  const latestTransaction = entity.transactions[0];
  const isConsumable = entity.kind === 'consumable';

  const owner = resolveEntityOwner(entity);
  const amount = buildEntityAmount(entity);
  const condition = formatConditionLabel(latestTransaction?.condition ?? '');

  return (
    <div className="overflow-hidden rounded-lg border border-[#e0ebe7] bg-[#f9fbfa] shadow-sm transition-colors hover:border-emerald-600/30 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div className="min-w-30 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#527a6d] dark:text-slate-400">
                {t('table.identifierLabel')}
              </p>
              <p className="mt-0.5 wrap-break-word text-sm font-medium text-[#0d261e] dark:text-slate-100">
                {entityTitle(entity)}
              </p>
            </div>
            <InfoBlock label={t('table.amountLabel')} value={amount} />
            <InfoBlock label={t('table.conditionLabel')} value={condition} />
            {isConsumable && (
              <InfoBlock
                label={t('table.expirationDateLabel')}
                value={displayValue(entity.expiryDate)}
              />
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#e0ebe7]/70 pt-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#527a6d] dark:text-slate-400">
                {t('table.currentOwnerLabel')}:
              </p>
              <span className="inline-flex items-center rounded-[14px] border border-transparent bg-[#f6ebd0]/60 px-2.5 py-0.5 text-xs font-normal text-[#5c410a] dark:bg-amber-950/50 dark:text-amber-200">
                {owner}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e0ebe7]/70 pt-3 md:min-w-35 md:flex-col md:border-l md:border-t-0 md:pl-4 md:pt-0 dark:border-slate-800">
          <button
            type="button"
            className="inline-flex h-8 min-h-8 w-full items-center justify-start gap-2 rounded-md border border-[#dce8e2] px-3 text-xs font-medium text-[#0d261e] transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <PencilIcon />
            {t('common.edit')}
          </button>
          <button
            type="button"
            onClick={onOpenTransfer}
            disabled={!hasTransactions}
            className="inline-flex h-8 min-h-8 w-full items-center justify-start gap-2 rounded-md border border-transparent bg-emerald-500/10 px-3 text-xs font-medium text-emerald-700 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:text-emerald-300"
          >
            <TransferIcon />
            {t('table.transferLabel')}
          </button>
        </div>
      </div>

      <div className="w-full border-t border-[#e0ebe7]/70 dark:border-slate-800">
        <button
          type="button"
          onClick={onToggleHistory}
          className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-xs font-semibold text-[#527a6d] transition hover:bg-[#edf4f1] dark:text-slate-300 dark:hover:bg-slate-800/60"
          style={{ fontFamily: '"Plus Jakarta Sans", Inter, sans-serif' }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="text-[#527a6d] dark:text-slate-400">
              <ClockIcon />
            </span>
            {t('table.transactionHistory')} ({entity.transactions.length})
          </span>
          <span
            className={clsx(
              'inline-flex text-[#527a6d] transition-transform dark:text-slate-400',
              isHistoryExpanded ? 'rotate-90' : 'rotate-270',
            )}
          >
            <ArrowIcon />
          </span>
        </button>
      </div>

      {isHistoryExpanded && (
        <div className="border-t border-[#e0ebe7]/70 px-4 pb-4 pt-1 dark:border-slate-800">
          <div className="mt-2 space-y-3">
            {hasTransactions ? (
              entity.transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))
            ) : (
              <p className="text-xs text-[#527a6d] dark:text-slate-400">
                {t('table.noItems')}
              </p>
            )}
            {/* <button
              type="button"
              className="mt-2 inline-flex h-7 min-h-8 items-center justify-center gap-1 rounded-[14px] border border-black/10 px-3 text-xs font-medium text-[#0d261e] transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <PlusIcon />
              {t('table.addHistoryRecord')}
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
}

type InfoBlockProps = {
  label: string;
  value: string;
};

function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <div className="min-w-30 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#527a6d] dark:text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 wrap-break-word text-sm font-medium text-[#0d261e] dark:text-slate-100">
        {displayValue(value)}
      </p>
    </div>
  );
}
