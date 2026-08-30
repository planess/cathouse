'use client';

import clsx from 'clsx';
import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from 'react';

import { ChevronIcon } from '@app/(general)/registry/[animalId]/components/icons';
import { Rate } from '@app/enum/rate';
import type { AccordionItemProps } from '@app/models/accordion-item-props.model';
import type { AccordionRenderState } from '@app/models/accordion-render-state.model';
import type { AccordionRenderable } from '@app/models/accordion-renderable.model';

const theme = {
  [Rate.ok]: {
    wrapper:
      'bg-green-50 border-green-100 dark:bg-lime-800/40 dark:border-green-700',
    bar: 'border-l-green-300',
  },
  [Rate.satisfactory]: {
    wrapper:
      'bg-amber-50 border-amber-100 dark:bg-amber-800/40 dark:border-amber-700',
    bar: 'border-l-amber-300',
  },
  [Rate.risk]: {
    wrapper:
      'bg-orange-50 border-orange-100 dark:bg-orange-800/40 dark:border-orange-700',
    bar: 'border-l-orange-300',
  },
  [Rate.danger]: {
    wrapper: 'bg-red-50 border-red-100 dark:bg-red-800/40 dark:border-red-700',
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

  const toggleButtonProps = useMemo<ButtonHTMLAttributes<HTMLButtonElement>>(
    () => ({
      type: 'button',
      className: clsx(
        'flex w-full items-center gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/50',
        disabled && 'cursor-not-allowed opacity-60',
      ),
      'aria-expanded': resolvedOpen,
      'aria-controls': contentId,
      onClick: handleToggle,
      disabled,
    }),
    [contentId, disabled, handleToggle, resolvedOpen],
  );

  const toneClasses = useMemo(() => {
    return (
      (rate && theme[rate]) || {
        wrapper:
          'bg-slate-50 border-slate-100 dark:bg-stone-800/40 dark:border-stone-700',
        bar: 'border-l-slate-300 dark:border-stone-600',
      }
    );
  }, [rate]);

  const hasDetails = useMemo(() => Boolean(details), [details]);

  const renderState = useMemo<AccordionRenderState>(
    () => ({
      isOpen: resolvedOpen,
      toggle: handleToggle,
      toggleButtonProps,
      chevron: (
        <span
          className={clsx(
            'text-slate-500 transition-transform duration-300 size-5',
            { 'rotate-180': resolvedOpen },
          )}
        >
          <ChevronIcon />
        </span>
      ),
    }),
    [handleToggle, resolvedOpen, toggleButtonProps],
  );

  const render = useCallback(
    (node: AccordionRenderable) =>
      typeof node === 'function' ? node(renderState) : node,
    [renderState],
  );

  const header = useMemo(() => {
    if (typeof title === 'function') {
      return render(title);
    }

    if (hasDetails) {
      return (
        <button {...toggleButtonProps}>
          <div className="flex-1 overflow-hidden">{title}</div>
          <span
            className={clsx(
              'text-slate-500 transition-transform duration-300 size-5',
              { 'rotate-180': resolvedOpen },
            )}
          >
            <ChevronIcon />
          </span>
        </button>
      );
    }

    return (
      <div className="flex-1 overflow-hidden text-slate-900 dark:text-slate-200">
        {title}
      </div>
    );
  }, [hasDetails, render, title, toggleButtonProps, resolvedOpen]);

  return (
    <article
      className={clsx(
        'rounded-md border px-4 py-3 transition-colors border-l-4',
        toneClasses.bar,
        toneClasses.wrapper,
        className,
      )}
    >
      {header}

      {summary && (
        <div className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors">
          {render(summary)}
        </div>
      )}

      {hasDetails && (
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
          <div
            ref={detailsRef}
            className="pt-4 text-slate-700 dark:text-stone-300 transition-colors"
          >
            {render(details)}
          </div>
        </div>
      )}
    </article>
  );
}
