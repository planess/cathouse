'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AdminAdminComponentsAdminSidebarIcon01 } from '@app/components/icons/admin-admin-components-admin-sidebar-icon-01';
import { AdminAdminComponentsAdminSidebarIcon02 } from '@app/components/icons/admin-admin-components-admin-sidebar-icon-02';
import { AdminAdminComponentsAdminSidebarIcon03 } from '@app/components/icons/admin-admin-components-admin-sidebar-icon-03';
import { AdminAdminComponentsAdminSidebarIcon04 } from '@app/components/icons/admin-admin-components-admin-sidebar-icon-04';
import { AdminAdminComponentsAdminSidebarIcon05 } from '@app/components/icons/admin-admin-components-admin-sidebar-icon-05';
import { AdminAdminComponentsAdminSidebarIcon06 } from '@app/components/icons/admin-admin-components-admin-sidebar-icon-06';
import { AdminAdminComponentsAdminSidebarIcon07 } from '@app/components/icons/admin-admin-components-admin-sidebar-icon-07';
import { AdminAdminComponentsAdminSidebarIcon08 } from '@app/components/icons/admin-admin-components-admin-sidebar-icon-08';
import { AdminAdminComponentsAdminSidebarIcon09 } from '@app/components/icons/admin-admin-components-admin-sidebar-icon-09';
import { useCurrentUser } from '@app/hooks/use-user';
import {
  SYSTEM_PERMISSIONS,
  type SystemPermission,
} from '@app/models/system-permissions';

import { SidebarIconProps, SidebarNavItem } from './admin-sidebar.types';

type NavItem = SidebarNavItem & {
  requiredAnyPermission?: SystemPermission[];
  requiredPermission?: SystemPermission;
};

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Overview',
    Icon: function DashboardIcon({ className }: SidebarIconProps) {
      return (
        <AdminAdminComponentsAdminSidebarIcon01
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        />
      );
    },
  },
  {
    href: '/admin/migrations',
    label: 'Migrations',
    Icon: function MigrationsIcon({ className }: SidebarIconProps) {
      return (
        <AdminAdminComponentsAdminSidebarIcon02
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        />
      );
    },
  },
  {
    href: '/admin/users',
    label: 'Users',
    Icon: function UsersIcon({ className }: SidebarIconProps) {
      return (
        <AdminAdminComponentsAdminSidebarIcon03
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        />
      );
    },
  },
  {
    href: '/admin/roles',
    label: 'Roles',
    Icon: function RolesIcon({ className }: SidebarIconProps) {
      return (
        <AdminAdminComponentsAdminSidebarIcon04
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        />
      );
    },
  },
  {
    href: '/admin/acts',
    label: 'Acts',
    Icon: function ActsIcon({ className }: SidebarIconProps) {
      return (
        <AdminAdminComponentsAdminSidebarIcon05
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        />
      );
    },
  },

  {
    href: '/admin/finance',
    label: 'Finance',
    Icon: function FinanceIcon({ className }: SidebarIconProps) {
      return (
        <AdminAdminComponentsAdminSidebarIcon06
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        />
      );
    },
  },

  {
    href: '/admin/inventory',
    label: 'Inventory',
    Icon: function InventoryIcon({ className }: SidebarIconProps) {
      return (
        <AdminAdminComponentsAdminSidebarIcon07
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        />
      );
    },
  },
  {
    href: '/admin/media',
    label: 'Media',
    requiredAnyPermission: [
      SYSTEM_PERMISSIONS.MEDIA_REVIEW,
      SYSTEM_PERMISSIONS.MEDIA_UPLOAD,
      SYSTEM_PERMISSIONS.MEDIA_DELETE,
    ],
    Icon: function MediaIcon({ className }: SidebarIconProps) {
      return (
        <AdminAdminComponentsAdminSidebarIcon08
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        />
      );
    },
  },
  {
    href: '/admin/media',
    label: 'Media',
    requiredAnyPermission: [
      SYSTEM_PERMISSIONS.MEDIA_REVIEW,
      SYSTEM_PERMISSIONS.MEDIA_UPLOAD,
      SYSTEM_PERMISSIONS.MEDIA_DELETE,
    ],
    Icon: function MediaIcon({ className }: SidebarIconProps) {
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <rect
            height="14.5"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            width="17"
            x="3.5"
            y="4.75"
          />
          <path
            d="m6.5 16 3.25-3.25 2.5 2.5 2.25-2.25 3 3"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <circle cx="15.75" cy="9" r="1.25" fill="currentColor" />
        </svg>
      );
    },
  },
  {
    href: '/admin/email',
    label: 'Email',
    requiredAnyPermission: [
      SYSTEM_PERMISSIONS.EMAIL_READ,
      SYSTEM_PERMISSIONS.EMAIL_SEND,
    ],
    Icon: function EmailIcon({ className }: SidebarIconProps) {
      return (
        <AdminAdminComponentsAdminSidebarIcon09
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        />
      );
    },
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const visibleNavItems = navItems.filter(
    ({ requiredAnyPermission, requiredPermission }) =>
      (requiredPermission === undefined ||
        user?.scopes.includes(requiredPermission) === true) &&
      (requiredAnyPermission === undefined ||
        requiredAnyPermission.some(
          (permission) => user?.scopes.includes(permission) === true,
        )),
  );

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-slate-200/80 bg-white/90 text-slate-700 shadow-sm shadow-slate-200/30 dark:border-slate-800 dark:bg-[#11161c] dark:text-slate-200">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-sky-500 p-2.5 text-white shadow-lg shadow-sky-500/30">
            <span className="text-sm font-bold">AP</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Admin Panel
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Mock: Enterprise Suite
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-sky-500/10 text-sky-600 shadow-sm shadow-sky-500/10 dark:bg-sky-500/20 dark:text-sky-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
              }`}
            >
              <item.Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200/80 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-700 shadow-inner shadow-slate-200/40 dark:bg-slate-900 dark:text-slate-300">
          <div className="h-9 w-9 rounded-full bg-linear-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center">
            AR
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
              Mock: Alex Rivera
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {user?.email ?? 'No email'}
            </p>
          </div>
        </div>
        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-sky-200 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-sky-400/40 dark:hover:text-sky-200"
          disabled
        >
          <span>Sign out</span>
          <span aria-hidden="true">{'->'}</span>
        </button>
      </div>
    </aside>
  );
}
