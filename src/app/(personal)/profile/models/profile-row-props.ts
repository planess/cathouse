import type { ReactNode } from 'react';

/** Props of a labeled line in a profile information list. */
export interface ProfileRowProps {
  /** Name of the information line. */
  label: string;
  /** Optional light explanation shown under the label. */
  hint?: string;
  /** Value of the line. */
  children: ReactNode;
}
