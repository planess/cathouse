import Image from 'next/image';
import { useTranslations } from 'next-intl';

import {
  ClockIcon,
  PencilIcon,
  TrashIcon,
} from '../../../../../(general)/history/[animalId]/components/icons';

import { displayValue, formatTransactionType } from './table-helpers';
import {
  resolveTransactionMediaKind,
  resolveTransactionMediaLabel,
} from './transaction-media.helpers';

import type { InventoryTransactionRow } from '../../types/inventory.types';

type TransactionRowProps = {
  transaction: InventoryTransactionRow;
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  const t = useTranslations('adminInventory');
  const quantity = transaction.remainingQuantity ?? transaction.quantity;
  const fromType = transaction.from?.type ?? '';
  const toType = transaction.to?.type ?? '';
  const startingPoint = transaction.from?.name ?? transaction.from?.id ?? '';
  const destination = transaction.to?.name ?? transaction.to?.id ?? '';
  const visibleMedia = transaction.media.filter(
    (asset) => asset.isDeleted !== true && asset.url.trim().length > 0,
  );

  return (
    <div className="rounded-md border border-[#e0ebe7]/80 bg-[#f1f5f3] p-3 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex gap-x-4 gap-y-2">
            <div className="flex flex-col gap-2">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0d261e] dark:text-slate-100">
                <span className="text-[#527a6d] dark:text-slate-400">
                  <ClockIcon />
                </span>
                {displayValue(transaction.date)}
              </p>
              <span className="inline-flex items-center rounded-[14px] border border-black/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0d261e] dark:border-slate-700 dark:text-slate-200">
                {formatTransactionType(transaction.type)}
              </span>
            </div>

            <div className="border-x border-gray-200" />

            <div className="">
              <p className="text-sm text-[#0d261e] dark:text-slate-200">
                <span>{fromType}</span>{' '}
                <span className="font-semibold">
                  {displayValue(startingPoint)}
                </span>
                {' => '}
                <span>{toType}</span>{' '}
                <span className="font-semibold">
                  {displayValue(destination)}
                </span>
              </p>
              <p className="text-sm text-[#0d261e] dark:text-slate-200">
                {t('table.amountInlineLabel')}:{' '}
                <span className="font-semibold">{quantity ?? '-'}</span>
              </p>
            </div>

            <div className="border-x border-gray-200" />

            <div>
              <p>Condition: {transaction.condition ?? '-'}</p>
              <p>Damage Description: {transaction.damageDescription ?? '-'}</p>
              <p>Estimated cost: {transaction.estimatedCost ?? '-'}</p>
            </div>
          </div>
          {visibleMedia.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-2">
              {visibleMedia.map((asset, index) => {
                const kind = resolveTransactionMediaKind(asset);
                const label = resolveTransactionMediaLabel(asset, index + 1);
                const key = `${asset.key || asset.url}-${asset.uploadedAt}-${index}`;

                if (kind === 'image') {
                  return (
                    <a
                      key={key}
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      title={label}
                      className="group relative block h-14 w-14 overflow-hidden rounded-md border border-[#d7e4df] bg-white dark:border-slate-700 dark:bg-slate-900"
                    >
                      <Image
                        src={asset.url}
                        alt={label}
                        fill
                        sizes="56px"
                        unoptimized
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </a>
                  );
                }

                if (kind === 'video') {
                  return (
                    <div
                      key={key}
                      title={label}
                      className="block overflow-hidden rounded-md border border-[#d7e4df] bg-white dark:border-slate-700 dark:bg-slate-900"
                    >
                      <video
                        className="h-14 w-20 object-cover"
                        controls
                        preload="metadata"
                      >
                        <source
                          src={asset.url}
                          type={asset.mimeType ?? undefined}
                        />
                      </video>
                    </div>
                  );
                }

                return (
                  <a
                    key={key}
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    title={label}
                    className="inline-flex max-w-56 items-center rounded-md border border-[#d7e4df] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1f5b48] transition hover:bg-[#edf4f1] hover:underline dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:justify-end">
          <button
            type="button"
            aria-label={t('common.edit')}
            className="inline-flex h-7 min-h-8 items-center justify-center rounded-md border border-transparent px-2 text-xs text-[#527a6d] transition hover:bg-slate-200/50 hover:text-[#0d261e] dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            aria-label={t('common.delete')}
            className="inline-flex h-7 min-h-8 items-center justify-center rounded-md border border-transparent px-2 text-xs text-rose-500 transition hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      {transaction.notes.trim().length > 0 ? (
        <p className="w-full text-sm text-[#527a6d] dark:text-slate-400">
          <span>{t('table.notesLabel')}:</span> {transaction.notes}
        </p>
      ) : null}
    </div>
  );
}
