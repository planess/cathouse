import type { InventoryCategoryNode } from '../../types/inventory.types';

type CategoryTreeSelectProps = {
  categories: InventoryCategoryNode[];
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

type CategoryRow = {
  id: string;
  name: string;
  depth: number;
};

export function CategoryTreeSelect({
  categories,
  value,
  onChange,
  onBlur,
}: CategoryTreeSelectProps) {
  const rows = flattenCategories(categories);

  return (
    <div
      className="max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white"
      role="radiogroup"
      onBlur={onBlur}
      tabIndex={-1}
    >
      {rows.map((row) => (
        <label
          key={row.id}
          className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 text-sm text-slate-700 last:border-b-0 hover:bg-slate-50"
          style={{ paddingLeft: `${12 + row.depth * 16}px` }}
        >
          <input
            type="radio"
            name="inventory-category-tree"
            value={row.id}
            checked={value === row.id}
            onChange={() => onChange(row.id)}
          />
          <span>{row.name}</span>
        </label>
      ))}
    </div>
  );
}

function flattenCategories(
  categories: InventoryCategoryNode[],
  depth = 0,
): CategoryRow[] {
  return categories.flatMap((category) => [
    { id: category.id, name: category.name, depth },
    ...flattenCategories(category.children, depth + 1),
  ]);
}
