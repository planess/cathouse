import type { Rate } from '@app/enum/rate';

import type { AccordionRenderable } from './accordion-renderable.model';

export type AccordionItemProps = {
  summary: AccordionRenderable;
  details: AccordionRenderable;
  title: AccordionRenderable;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onToggle?: (nextIsOpen: boolean) => void;
  disabled?: boolean;
  className?: string;
  bodyClassName?: string;
  rate?: Rate;
};
