/** Link shown in the sidebar of the personal area. */
export interface PersonalNavItem {
  /** Route the link points to; nested routes keep the item active. */
  href: string;
  /** Translation key inside the `personalsidebar` namespace. */
  labelKey: string;
}
