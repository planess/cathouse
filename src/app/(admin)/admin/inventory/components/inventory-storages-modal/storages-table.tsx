import type { InventoryStorageRow } from '../../types/inventory.types';

type StoragesTableProps = {
  storages: InventoryStorageRow[];
  locationLabel: (storage: InventoryStorageRow) => string;
  onEdit: (storage: InventoryStorageRow) => void;
  onDelete: (storage: InventoryStorageRow) => void;
  labels: {
    name: string;
    location: string;
    createdAt: string;
    actions: string;
    empty: string;
    editAria: (name: string) => string;
    deleteAria: (name: string) => string;
  };
};

export function StoragesTable({
  storages,
  locationLabel,
  onEdit,
  onDelete,
  labels,
}: StoragesTableProps) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        <tr>
          <th className="px-5 py-3">{labels.name}</th>
          <th className="px-5 py-3">{labels.location}</th>
          <th className="px-5 py-3">{labels.createdAt}</th>
          <th className="px-5 py-3 text-right">{labels.actions}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200/70">
        {storages.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-5 py-6 text-center text-sm text-slate-500">
              {labels.empty}
            </td>
          </tr>
        ) : (
          storages.map((storage) => (
            <tr key={storage.id}>
              <td className="px-5 py-4 font-semibold text-slate-800">{storage.name}</td>
              <td className="px-5 py-4 text-xs font-mono text-slate-500">
                {locationLabel(storage)}
              </td>
              <td className="px-5 py-4 text-xs text-slate-500">
                {storage.createdAt || '-'}
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(storage)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:text-sky-500"
                    aria-label={labels.editAria(storage.name)}
                  >
                    ✎
                  </button>
                  {storage.canDelete ? (
                    <button
                      type="button"
                      onClick={() => onDelete(storage)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:text-rose-500"
                      aria-label={labels.deleteAria(storage.name)}
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
