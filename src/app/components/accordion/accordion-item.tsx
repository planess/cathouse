'use client';

import { ChevronIcon } from '@app/(general)/history/[animalId]/components/icons';
import { Rate } from '@app/enum/rate';
import clsx from 'clsx';
import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type AccordionRenderable =
  | ReactNode
  | ((state: { isOpen: boolean; toggle: () => void }) => ReactNode);



export type AccordionItemProps = {
  /**
   * Content that always stays visible – usually the summary row.
   */
  summary: AccordionRenderable;
  /**
   * Collapsible content shown only when the accordion item is opened.
   */
  details: AccordionRenderable;

  title: AccordionRenderable;
  /**
   * Optional controlled open state. When provided the component becomes controlled.
   */
  isOpen?: boolean;
  /**
   * Default open state for uncontrolled mode.
   */
  defaultOpen?: boolean;
  /**
   * Fires whenever the open state changes (both controlled and uncontrolled modes).
   */
  onToggle?: (nextIsOpen: boolean) => void;
  /**
   * Disables the toggle button.
   */
  disabled?: boolean;
  /**
   * Tailwind utility classes applied to the outer wrapper.
   */
  className?: string;
  /**
   * Tailwind utility classes applied to the collapsible body container.
   */
  bodyClassName?: string;
  /**
   * Optional accent variant controlling default colors.
   */
  rate?: Rate;
};

const theme = {
  [Rate.ok]: {
    wrapper: 'bg-green-50 border-green-100',
    bar: 'border-l-green-300',
  },
  [Rate.satisfactory]: {
    wrapper: 'bg-amber-50 border-amber-100',
    bar: 'border-l-amber-300',
  },
  [Rate.risk]: {
    wrapper: 'bg-orange-50 border-orange-100',
    bar: 'border-l-orange-300',
  },
  [Rate.danger]: {
    wrapper: 'bg-red-50 border-red-100',
    bar: 'border-l-red-300',
  },
};

export function AccordionItem({
  title,
  summary,
  details,
  isOpen,
  defaultOpen = false,
  onToggle,
  disabled = false,
  className,
  bodyClassName,
  rate,
}: AccordionItemProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);
  const isControlled = typeof isOpen === 'boolean';
  const resolvedOpen = isControlled ? Boolean(isOpen) : internalOpen;
  const instanceId = useId();
  const contentId = `${instanceId}-content`;
  const detailsRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const element = detailsRef.current;

    if (!element) {
      return;
    }

    const updateHeight = () => {
      setContentHeight(element.scrollHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const handleToggle = useCallback(() => {
    if (disabled) {
      return;
    }

    const next = !resolvedOpen;
    if (!isControlled) {
      setInternalOpen(next);
    }

    onToggle?.(next);
  }, [disabled, isControlled, onToggle, resolvedOpen]);

  const toneClasses = useMemo(() => {
    return (
      (rate && theme[rate]) || {
        wrapper: 'bg-slate-50 border-slate-100',
        bar: 'border-l-slate-300',
      }
    );
  }, [rate]);

  const render = useCallback(
    (node: AccordionRenderable) =>
      typeof node === 'function'
        ? node({ isOpen: resolvedOpen, toggle: handleToggle })
        : node,
    [handleToggle, resolvedOpen],
  );

  return (
    <article
      className={clsx(
        'rounded-md border px-4 py-3 transition border-l-4',
        toneClasses.bar,
        toneClasses.wrapper,
        className,
      )}
    >
      <button
        type="button"
        className={clsx(
          'flex w-full items-center gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/50',
          disabled && 'cursor-not-allowed opacity-60',
        )}
        aria-expanded={resolvedOpen}
        aria-controls={contentId}
        onClick={handleToggle}
        disabled={disabled}
      >
        <div className="flex-1 overflow-hidden">{render(title)}</div>
        <ChevronIcon isOpen={resolvedOpen} />
      </button>

      {summary && (
        <div className="mt-3 text-sm font-medium text-slate-600">
          {render(summary)}
        </div>
      )}

      <div
        id={contentId}
        aria-hidden={!resolvedOpen}
        className={clsx(
          'overflow-hidden transition-[max-height,opacity] duration-300 ease-out',
          resolvedOpen ? 'opacity-100' : 'opacity-0',
          bodyClassName,
        )}
        style={{ maxHeight: resolvedOpen ? `${contentHeight}px` : '0px' }}
      >
        <div ref={detailsRef} className="pt-4 text-slate-700">
          {render(details)}
        </div>
      </div>
    </article>
  );
}
