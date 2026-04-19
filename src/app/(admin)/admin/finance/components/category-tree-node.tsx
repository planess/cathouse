import { useTranslations } from 'next-intl';
import { useState } from 'react';

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
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="h-3.5 w-3.5"
            >
              <path
                d="M12 20h9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m16.5 3.5 4 4L8 20H4v-4z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="text-xs font-semibold text-rose-500"
            type="button"
            onClick={() => onDelete(node.id)}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="h-3.5 w-3.5"
            >
              <path
                d="M4 7h16M10 11v6m4-6v6M5 7l1.5 12a2 2 0 002 2h5a2 2 0 002-2L19 7M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
