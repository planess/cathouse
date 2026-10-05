'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';

/** Props for {@link LandingAnchorLink}. */
export interface LandingAnchorLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** In-page target in the form `#section-id`. */
  href: `#${string}`;
}

/**
 * In-page link that scrolls smoothly to its target without changing the URL, so it adds no hash
 * entries to the browser history (hash entries break the Back button after leaving the page).
 */
export function LandingAnchorLink({
  href,
  onClick,
  ...props
}: LandingAnchorLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const target = document.getElementById(href.slice(1));

    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return <a {...props} href={href} onClick={handleClick} />;
}
