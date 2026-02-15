import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CategoryNode } from '../models/category-node';

export default function CategoryTreeNode({
  node,
  onDelete,
}: {
  node: CategoryNode;
  onDelete: (categoryId: string) => void;
}) {
  const t = useTranslations('adminFinance');
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-sm text-slate-700">
        <button
          className="flex items-center gap-2"
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <span className="text-xs font-semibold text-slate-600">
            {expanded ? '−' : '+'}
          </span>
          <span className="font-semibold">{node.name}</span>
        </button>
        <button
          className="text-xs font-semibold text-rose-500"
          type="button"
          onClick={() => onDelete(node.id)}
        >
          {t('common.delete')}
        </button>
      </div>
      {expanded && node.children.length > 0 && (
        <div className="mt-2 space-y-2 pl-4">
          {node.children.map((child) => (
            <CategoryTreeNode key={child.id} node={child} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
