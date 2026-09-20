'use client';

import { useEffect } from 'react';

let activeScrollLocks = 0;
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';

function lockBodyScroll() {
  const body = document.body;

  if (activeScrollLocks === 0) {
    originalBodyOverflow = body.style.overflow;
    originalBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      const computedPaddingRight =
        Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

      body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`;
    }

    body.style.overflow = 'hidden';
  }

  activeScrollLocks += 1;
}

function unlockBodyScroll() {
  activeScrollLocks = Math.max(0, activeScrollLocks - 1);

  if (activeScrollLocks > 0) {
    return;
  }

  document.body.style.overflow = originalBodyOverflow;
  document.body.style.paddingRight = originalBodyPaddingRight;
}

/**
 * Disables global page scrolling while an overlay that owns scrolling is open.
 *
 * @param enabled Whether this component currently requires the page scroll lock.
 */
export function useBodyScrollLock(enabled = true): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    lockBodyScroll();

    return unlockBodyScroll;
  }, [enabled]);
}
