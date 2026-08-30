import type { AccordionRenderState } from './accordion-render-state.model';
import type { ReactNode } from 'react';

export type AccordionRenderable =
  | ReactNode
  | ((state: AccordionRenderState) => ReactNode);
