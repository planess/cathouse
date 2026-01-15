'use client';

import clsx from 'clsx';
import {
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

const TOUCH_DISMISS_DELAY = 2000;

// Map each placement to the corresponding absolute positioning helpers.
const positionClassMap: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

export interface TooltipProps {
  text: string;
  children: ReactNode;
  placement?: TooltipPlacement;
  containerClassName?: string;
  panelClassName?: string;
  targetClassName?: string;
}

export function Tooltip({
  text,
  children,
  placement = 'top',
  containerClassName,
  panelClassName,
  targetClassName,
}: TooltipProps) {
  const tooltipId = useId();
  const [isActive, setIsActive] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const clearHideTimeout = () => {
    if (!hideTimeoutRef.current) {
      return;
    }

    clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = null;
  };

  const activate = () => {
    clearHideTimeout();
    setIsActive(true);
  };

  const deactivate = () => {
    clearHideTimeout();
    setIsActive(false);
  };

  const scheduleTouchHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsActive(false);
      hideTimeoutRef.current = null;
    }, TOUCH_DISMISS_DELAY);
  };

  useEffect(() => () => clearHideTimeout(), []);

  useLayoutEffect(() => {
    if (!isActive) {
      setOffset({ x: 0, y: 0 });
      setIsVisible(false);
      return;
    }

    const updateOffsets = () => {
      if (!tooltipRef.current) {
        return;
      }

      const rect = tooltipRef.current.getBoundingClientRect();
      const padding = 12;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      let x = 0;
      let y = 0;

      if (rect.left < padding) {
        x = padding - rect.left;
      } else if (rect.right > viewportWidth - padding) {
        x = viewportWidth - padding - rect.right;
      }

      if (rect.top < padding) {
        y = padding - rect.top;
      } else if (rect.bottom > viewportHeight - padding) {
        y = viewportHeight - padding - rect.bottom;
      }

      setOffset({ x, y });
      setIsVisible(true);
    };

    updateOffsets();
    const handleResize = () => {
      setOffset({ x: 0, y: 0 });
      setIsVisible(false);
      // Re-run measurement on next frame
      requestAnimationFrame(updateOffsets);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, text]);

  const handlePointerEnter = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      activate();
    }
  };

  const handlePointerLeave = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      deactivate();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'touch') {
      activate();
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'touch') {
      scheduleTouchHide();
    }
  };

  const handlePointerCancel = () => {
    deactivate();
  };

  const handleFocus = () => activate();
  const handleBlur = () => deactivate();

  const isElementChild = isValidElement(children);
  const existingDescribedBy = isElementChild
    ? (children as ReactElement).props?.['aria-describedby']
    : undefined;
  const describedByValue = isActive
    ? [existingDescribedBy, tooltipId].filter(Boolean).join(' ')
    : existingDescribedBy;

  const trigger = isElementChild ? (
    cloneElement(children as ReactElement, {
      'aria-describedby': describedByValue ?? undefined,
    })
  ) : (
    <span
      aria-describedby={isActive ? tooltipId : undefined}
      className="inline"
    >
      {children}
    </span>
  );

  return (
    <span
      className={clsx('relative inline-flex', containerClassName)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <span className={targetClassName}>{trigger}</span>
      {isActive && (
        <span
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={clsx(
            'pointer-events-none absolute z-20 w-max max-w-[min(280px,calc(100vw-32px))] whitespace-normal rounded-md bg-neutral-900 px-2.5 py-1.5 text-center text-xs font-medium text-stone-100 shadow-lg transition-opacity duration-150',
            positionClassMap[placement],
            isVisible ? 'opacity-100' : 'opacity-0',
            panelClassName,
          )}
          style={{
            marginLeft: offset.x,
            marginTop: offset.y,
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
