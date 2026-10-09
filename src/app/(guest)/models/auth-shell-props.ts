import type { ReactNode } from 'react';

import type { AuthLink } from './auth-link';

/** Props of the two-panel guest (auth) page layout. */
export interface AuthShellProps {
  /** Large serif heading shown in the brand panel. */
  tagline: string;
  /** Supporting text shown under the tagline on wide screens. */
  description: string;
  /** Primary link shown under the form, before the "back to site" link. */
  link?: AuthLink;
  /** Form card content. */
  children: ReactNode;
}
