'use client';

import clsx from 'clsx';
import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export type ModalTone = 'primary' | 'secondary' | 'danger' | 'ghost';

export type ModalAction<T> = {
  id?: string;
  label: string;
  tone?: ModalTone;
  onSelect?: () => Promise<T> | T | void;
  value?: T;
  disabled?: boolean;
  autoClose?: boolean;
};

export type ModalOptions<T> = {
  title?: string;
  content?: ReactNode | (() => ReactNode);
  description?: ReactNode;
  actions?: ModalAction<T>[];
  dismissible?: boolean;
  dismissLabel?: string;
  size?: 'sm' | 'md' | 'lg';
};

type ModalContextValue = {
  showModal: <T,>(options: ModalOptions<T>) => Promise<T | undefined>;
  dismissModal: (result?: unknown) => void;
  isOpen: boolean;
};

type InternalModalState = {
  options: ModalOptions<unknown>;
  resolve: (value: unknown) => void;
  id: number;
};

const defaultContext: ModalContextValue = {
  showModal: async () => undefined,
  dismissModal: () => undefined,
  isOpen: false,
};

export const ModalContext = createContext<ModalContextValue>(defaultContext);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modalStack, setModalStack] = useState<InternalModalState[]>([]);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const activeModal = modalStack[modalStack.length - 1] ?? null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dismissModal = useCallback((result?: unknown) => {
    setPendingActionId(null);
    setModalStack((current) => {
      if (current.length === 0) {
        return current;
      }

      const closing = current[current.length - 1];
      closing?.resolve(result);

      return current.slice(0, -1);
    });
  }, []);

  const showModal = useCallback(
    <T,>(options: ModalOptions<T>) =>
      new Promise<T | undefined>((resolve) => {
        setModalStack((current) => [
          ...current,
          {
            options,
            resolve: resolve as (value: unknown) => void,
            id: Date.now() + Math.random(),
          },
        ]);
      }),
    [],
  );

  useEffect(() => {
    if (!activeModal) {
      return;
    }

    const dismissible = activeModal.options.dismissible ?? true;

    if (!dismissible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        dismissModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, dismissModal]);

  const handleAction = useCallback(
    async (action: ModalAction<unknown>, modalId: number) => {
      if (action.disabled) {
        return;
      }

      const currentTop = modalStack[modalStack.length - 1]?.id;

      if (!currentTop || currentTop !== modalId) {
        return;
      }

      const autoClose = action.autoClose !== false;
      const actionId = action.id ?? action.label;

      setPendingActionId(actionId);

      try {
        const outcome = (await action.onSelect?.()) ?? action.value;

        if (autoClose) {
          dismissModal(outcome);
          return;
        }

        if (typeof outcome !== 'undefined') {
          setModalStack((current) => {
            const target = current.find((state) => state.id === modalId);
            target?.resolve(outcome);
            return current;
          });
        }
      } catch (error) {
        console.error('Modal action failed', error);
      } finally {
        setPendingActionId(null);
      }
    },
    [dismissModal, modalStack],
  );

  const contextValue = useMemo<ModalContextValue>(
    () => ({
      showModal,
      dismissModal,
      isOpen: modalStack.length > 0,
    }),
    [dismissModal, modalStack.length, showModal],
  );

  const renderModals = () => {
    if (!modalStack.length || !isMounted) {
      return null;
    }

    return createPortal(
      <>
        {modalStack.map((state, index) => {
          const { options } = state;
          const dismissible = options.dismissible ?? true;
          const actions = (options.actions as ModalAction<unknown>[] | undefined) ?? [
            {
              id: 'default-modal-close',
              label: options.dismissLabel ?? 'Close',
              tone: 'primary',
              onSelect: () => undefined,
            },
          ];

          const content = typeof options.content === 'function'
            ? options.content()
            : options.content ?? options.description;

          const sizeClass = {
            sm: 'max-w-md',
            md: 'max-w-lg',
            lg: 'max-w-2xl',
          }[options.size ?? 'md'];

          const isTop = index === modalStack.length - 1;
          const overlayOpacity = Math.min(0.45 + index * 0.08, 0.8);

          return (
            <div
              key={state.id}
              className={clsx(
                'fixed inset-0 flex items-center justify-center px-4 py-6 backdrop-blur-sm',
                isTop ? 'pointer-events-auto' : 'pointer-events-none',
              )}
              style={{
                zIndex: 50 + index,
                backgroundColor: `rgba(15,23,42,${overlayOpacity})`,
              }}
            >
              <button
                type="button"
                className="absolute inset-0 h-full w-full cursor-default"
                aria-label="Dismiss modal overlay"
                onClick={() => {
                  if (isTop && dismissible) {
                    dismissModal();
                  }
                }}
              />

              <div
                className={clsx(
                  'relative z-10 flex w-full max-h-[95vh] transform flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition',
                  !isTop && 'scale-[0.98]',
                  sizeClass,
                )}
                role="dialog"
                aria-modal="true"
                aria-hidden={!isTop}
              >
                {dismissible && (
                  <button
                    type="button"
                    onClick={() => isTop && dismissModal()}
                    className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Close modal"
                    disabled={!isTop}
                  >
                    <CloseIcon />
                  </button>
                )}

                <div className="flex-1 overflow-y-auto pr-1">
                  {options.title && (
                    <h2 className="mb-2 text-2xl font-semibold text-slate-900">
                      {options.title}
                    </h2>
                  )}

                  {options.description && (
                    <p className="mb-4 text-sm text-slate-600">{options.description}</p>
                  )}

                  {content && (
                    <div className="mt-4 text-slate-700">{content}</div>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  {actions.map((action) => {
                    const tone = action.tone ?? 'secondary';
                    const actionId = action.id ?? action.label;
                    const isLoading = pendingActionId === actionId && isTop;

                    return (
                      <button
                        key={actionId}
                        type="button"
                        disabled={action.disabled || isLoading || !isTop}
                        onClick={() => void handleAction(action, state.id)}
                        className={clsx(
                          'inline-flex min-w-[96px] items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition',
                          resolveToneClass(tone),
                          (action.disabled || isLoading || !isTop) && 'opacity-60',
                        )}
                      >
                        {isLoading ? 'Please wait…' : action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </>,
      document.body,
    );
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {renderModals()}
    </ModalContext.Provider>
  );
}

function resolveToneClass(tone: ModalTone) {
  switch (tone) {
    case 'primary':
      return 'bg-slate-900 text-white hover:bg-slate-800';
    case 'danger':
      return 'bg-rose-600 text-white hover:bg-rose-700';
    case 'ghost':
      return 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900';
    default:
      return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
  }
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
