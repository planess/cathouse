import type { PersonalNavItem } from './personal-nav-item';

/** Personal area links in sidebar order. */
export const PERSONAL_NAV_ITEMS: readonly PersonalNavItem[] = [
  { href: '/profile/info', labelKey: 'info' },
  { href: '/profile/sessions', labelKey: 'sessions' },
  { href: '/profile/wards', labelKey: 'wards' },
];
