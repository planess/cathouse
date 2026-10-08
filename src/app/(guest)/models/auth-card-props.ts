import type { ReactNode } from 'react';

/** Props of the card that hosts a guest (auth) form. */
export interface AuthCardProps {
  /** Card heading. */
  title: string;
  /** Card content. */
  children: ReactNode;
}
