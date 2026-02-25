import { ReactNode } from 'react';

export type SidebarIconProps = {
  className?: string;
};

export type SidebarNavItem = {
  href: string;
  label: string;
  Icon: (props: SidebarIconProps) => ReactNode;
};
