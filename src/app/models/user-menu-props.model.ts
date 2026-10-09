/** Props of the footer user menu. */
export interface UserMenuProps {
  /** Email of the authenticated user, shown as the menu trigger. */
  email: string;
  /** Whether the admin panel link is shown. */
  canAccessAdmin: boolean;
}
