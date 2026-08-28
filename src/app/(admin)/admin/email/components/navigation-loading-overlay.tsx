'use client';

type NavigationLoadingOverlayProps = {
  label: string;
};

export function NavigationLoadingOverlay({
  label,
}: NavigationLoadingOverlayProps) {
  return (
    <div
      aria-live="polite"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-[1px] dark:bg-slate-950/50"
      role="status"
    >
      <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg dark:bg-slate-900 dark:text-slate-200">
        <span
          aria-hidden="true"
          className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400"
        />
        {label}
      </div>
    </div>
  );
}
