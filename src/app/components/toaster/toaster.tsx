import clsx from 'clsx';

import type { Toast } from '@app/models/toast';

/** Props of the `Toaster` component. */
interface ToasterProps {
  /** Toasts to show, oldest first. */
  toasts: Toast[];
}

/**
 * Shows temporary, non-interactive messages stacked in the bottom-right corner.
 * Clicks pass through the toasts, and screen readers announce them politely.
 *
 * @param props - Component props.
 * @param props.toasts - Toasts to show, oldest first.
 * @returns The toast stack, or nothing when there are no toasts.
 */
export function Toaster({ toasts }: ToasterProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:bottom-6"
      role="status"
    >
      {toasts.map((toast) => (
        <div
          className={clsx(
            'w-full max-w-sm break-words rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur',
            {
              'border-emerald-200 bg-emerald-50/95 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/90 dark:text-emerald-200':
                toast.kind === 'success',
              'border-rose-200 bg-rose-50/95 text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/90 dark:text-rose-200':
                toast.kind === 'error',
              'border-sky-200 bg-sky-50/95 text-sky-800 dark:border-sky-500/30 dark:bg-sky-950/90 dark:text-sky-200':
                toast.kind === 'info',
            },
          )}
          key={toast.id}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
