import type { ToastKind } from './toast-kind';

/** A temporary, non-interactive message shown in the toaster. */
export interface Toast {
  /** Unique identifier of the toast. */
  id: number;
  /** Visual kind of the toast. */
  kind: ToastKind;
  /** Text shown to the user. */
  message: string;
}
