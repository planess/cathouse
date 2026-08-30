import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type AccordionRenderState = {
  isOpen: boolean;
  toggle: () => void;
  toggleButtonProps: ButtonHTMLAttributes<HTMLButtonElement>;
  chevron: ReactNode;
};
