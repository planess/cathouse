import type { Toast } from './toast';
import type { ToastKind } from './toast-kind';

/** Toasts currently shown and a way to add more, as returned by `useToasts`. */
export interface ToastsState {
  /** Toasts currently visible, oldest first. */
  toasts: Toast[];
  /**
   * Shows a toast that hides itself after a few seconds.
   *
   * @param kind - Visual kind of the toast.
   * @param message - Text shown to the user.
   */
  showToast: (kind: ToastKind, message: string) => void;
}
