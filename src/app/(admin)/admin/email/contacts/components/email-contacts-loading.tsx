/** Placeholder contact rows shown under the spinner while contacts load. */
const PLACEHOLDER_ROWS = 6;

/**
 * Loading state for the contacts list: a list-shaped placeholder with a
 * spinner overlay, shown until the contacts data is streamed in.
 */
export function EmailContactsLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
      role="status"
    >
      <div
        aria-hidden="true"
        className="divide-y divide-slate-200 dark:divide-slate-800"
      >
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
          <div
            className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1.35fr_auto] md:items-center"
            key={index}
          >
            <span className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-900" />
            <span className="h-4 w-48 rounded bg-slate-100 dark:bg-slate-900" />
            <span className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-900" />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] dark:bg-slate-950/60">
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg dark:bg-slate-900 dark:text-slate-200">
          <span
            aria-hidden="true"
            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400"
          />
          Loading contacts...
        </div>
      </div>
    </div>
  );
}
