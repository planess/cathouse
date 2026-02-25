import clsx from 'clsx';
import { useTranslations } from 'next-intl';

import {
  IncomingParentTreeSelectProps,
  TreeItemProps,
} from '../models/props/incoming-parent-tree-select-props';

function TreeItem({
  node,
  depth,
  selectedParentId,
  disabled,
  onSelect,
}: TreeItemProps) {
  const t = useTranslations('adminFinance');
  const isSelected = selectedParentId === node.id;

  return (
    <div className="space-y-1">
      <button
        className={clsx(
          'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition',
          disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            : 'hover:border-sky-200 hover:bg-sky-50/60',
          isSelected
            ? 'border-sky-300 bg-sky-50 text-sky-700'
            : node.active === false
              ? 'border-slate-200 bg-slate-100 text-slate-400'
              : 'border-slate-200 bg-white text-slate-700',
        )}
        type="button"
        onClick={() => onSelect(node.id)}
        disabled={disabled}
        style={{ marginLeft: `${depth * 12}px` }}
      >
        <span className="font-medium">{node.name}</span>
        <span className="flex items-center gap-2">
          {node.active === false ? (
            <span className="rounded-full border border-slate-300 bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              {t('categories.inactiveBadge')}
            </span>
          ) : null}
        </span>
      </button>
      {node.children.length > 0 ? (
        <div className="space-y-1">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedParentId={selectedParentId}
              disabled={disabled}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function IncomingParentTreeSelect({
  categories,
  selectedParentId,
  disabled,
  emptyLabel,
  onSelect,
}: IncomingParentTreeSelectProps) {
  const t = useTranslations('adminFinance');

  return (
    <div className="space-y-2">
      <button
        className={clsx(
          'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition',
          disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            : 'hover:border-sky-200 hover:bg-sky-50/60',
          selectedParentId === ''
            ? 'border-sky-300 bg-sky-50 text-sky-700'
            : 'border-slate-200 bg-white text-slate-700',
        )}
        type="button"
        onClick={() => onSelect('')}
        disabled={disabled}
      >
        <span className="font-medium">{emptyLabel}</span>
      </button>
      <div className="max-h-56 space-y-1 overflow-auto rounded-xl border border-slate-200/70 bg-slate-50/60 p-2">
        {categories.length === 0 ? (
          <p className="px-2 py-1 text-xs text-slate-400">
            {t('categories.noCategories')}
          </p>
        ) : (
          categories.map((node) => (
            <TreeItem
              key={node.id}
              node={node}
              depth={0}
              selectedParentId={selectedParentId}
              disabled={disabled}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
