'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Base styles applied inside the shadow root. Page styles (including Tailwind
 * preflight and arbitrary variants) do not cross the shadow boundary, so the
 * email body typography is defined here. Inherited properties such as `color`,
 * `font`, and `overflow-wrap` still flow in from the host element.
 */
const SHADOW_STYLES = `
:host {
  display: block;
}
.email-body {
  max-width: 100%;
  overflow-x: auto;
}
.email-body table {
  max-width: 100% !important;
}
.email-body td,
.email-body th {
  width: auto !important;
}
.email-body img {
  max-width: 100%;
  height: auto;
}
.email-body p {
  margin: 0.75rem 0;
}
.email-body blockquote {
  margin: 1rem 0 1rem 1rem;
  padding: 0.75rem 1rem;
  border-left: 4px solid #cbd5e1;
  background-color: rgb(241 245 249 / 0.8);
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.5rem;
}
@media (prefers-color-scheme: dark) {
  .email-body blockquote {
    border-left-color: #475569;
    background-color: rgb(15 23 42 / 0.7);
    color: #cbd5e1;
  }
}
`;

/**
 * Props for {@link EmailHtmlBody}.
 */
interface EmailHtmlBodyProps {
  /** Sanitized email HTML to render inside the isolated shadow root. */
  html: string;
  /** Class names applied to the host element (inherited text styles reach the email body). */
  className?: string;
}

/**
 * Renders email HTML inside a shadow root so `<style>` and `<link>` tags from
 * the message cannot leak into the rest of the page, and page styles do not
 * restyle the message.
 *
 * @param props - Component props.
 * @param props.html - Sanitized email HTML.
 * @param props.className - Host element class names.
 */
export function EmailHtmlBody({ html, className }: EmailHtmlBodyProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;

    if (host === null) {
      return;
    }

    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `<style>${SHADOW_STYLES}</style><div class="email-body">${html}</div>`;
  }, [html]);

  return <div className={className} ref={hostRef} />;
}
