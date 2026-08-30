import type { NavigationItem } from './navigation-item.model';
import type { ReactNode } from 'react';

export interface OfferNavigationProps {
  title: string;
  subtitle: string;
  items: NavigationItem[];
  children?: ReactNode;
}
