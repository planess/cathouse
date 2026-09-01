import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminAdminFinanceComponentsCategoryTreeNodeIcon01 } from '@app/components/icons/admin-admin-finance-components-category-tree-node-icon-01';
import { AdminAdminFinanceComponentsCategoryTreeNodeIcon02 } from '@app/components/icons/admin-admin-finance-components-category-tree-node-icon-02';

import { CategoryTreeNodeProps } from '../models/props/category-tree-props';

export default function CategoryTreeNode({
  node,
  onEdit,
  onDelete,
}: CategoryTreeNodeProps) {
  const t = useTranslations('adminFinance');
  const [expanded, setExpanded] = useState(true);
  const hasLinkedOutgoingLabel =
    node.linkedToName !== undefined && node.linkedToName !== '';

  return (
    <div>
      <div
        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm text-slate-700 ${
          node.active === false
            ? 'border-slate-300 bg-slate-100 text-slate-500'
            : 'border-slate-200/70 bg-slate-50/70'
        }`}
      >
        <button
          className="flex items-center gap-2"
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span className="text-xs font-semibold text-slate-600">
            {expanded ? '−' : '+'}
          </span>
          <span className="font-semibold">{node.name}</span>
          {node.active === false ? (
            <span className="rounded-full border border-slate-300 bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              {t('categories.inactiveBadge')}
            </span>
          ) : null}
          {hasLinkedOutgoingLabel ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              -&gt; {node.linkedToName}
            </span>
          ) : null}
        </button>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
            type="button"
            aria-label={t('categories.editAria', { name: node.name })}
            title={t('categories.editAria', { name: node.name })}
            onClick={() => onEdit(node.id)}
          >
            <AdminAdminFinanceComponentsCategoryTreeNodeIcon01
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="h-3.5 w-3.5"
            />
          </button>
          <button
            className="text-xs font-semibold text-rose-500"
            type="button"
            onClick={() => onDelete(node.id)}
          >
            <AdminAdminFinanceComponentsCategoryTreeNodeIcon02
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="h-3.5 w-3.5"
            />
          </button>
        </div>
      </div>
      {expanded && node.children.length > 0 && (
        <div className="mt-2 space-y-2 pl-4">
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
