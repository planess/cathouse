'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Toast } from '@app/models/toast';
import type { ToastKind } from '@app/models/toast-kind';
import type { ToastsState } from '@app/models/toasts-state';

/** How long a toast stays visible, in milliseconds. */
const TOAST_DURATION_MS = 5000;

/**
 * Keeps a list of temporary toasts that remove themselves after a few seconds.
 * Render the returned `toasts` with the `Toaster` component.
 *
 * @returns The visible toasts and a function that shows a new one.
 */
export function useToasts(): ToastsState {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(0);
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const showToast = useCallback((kind: ToastKind, message: string) => {
    nextIdRef.current += 1;
    const id = nextIdRef.current;

    setToasts((current) => [...current, { id, kind, message }]);

    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);

    timersRef.current.add(timer);
  }, []);

  return { showToast, toasts };
}
