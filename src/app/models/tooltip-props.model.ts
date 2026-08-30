import type { ReactNode } from 'react';

export interface TooltipProps {
  text: string;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  containerClassName?: string;
  panelClassName?: string;
  targetClassName?: string;
}
