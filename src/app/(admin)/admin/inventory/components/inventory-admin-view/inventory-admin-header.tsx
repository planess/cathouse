type InventoryAdminHeaderProps = {
  title: string;
  subtitle: string;
  storagesLabel: string;
  categoriesLabel: string;
  addItemLabel: string;
  onOpenStorages: () => void;
  onOpenCategories: () => void;
  onAddItem: () => void;
};

export function InventoryAdminHeader({
  title,
  subtitle,
  storagesLabel,
  categoriesLabel,
  addItemLabel,
  onOpenStorages,
  onOpenCategories,
  onAddItem,
}: InventoryAdminHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onOpenStorages}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {storagesLabel}
        </button>
        <button
          type="button"
          onClick={onOpenCategories}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {categoriesLabel}
        </button>
        <button
          type="button"
          onClick={onAddItem}
          className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {addItemLabel}
        </button>
      </div>
    </div>
  );
}
