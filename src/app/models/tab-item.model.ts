import type { ReactNode } from 'react';

export type TabItem = {
  id: string;
  label: string;
  badge?: string | number;
  content?: ReactNode;
};
