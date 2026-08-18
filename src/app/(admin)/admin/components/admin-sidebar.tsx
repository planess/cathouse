'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useCurrentUser } from '@app/hooks/use-user';
import {
  SYSTEM_PERMISSIONS,
  type SystemPermission,
} from '@app/models/system-permissions';

import { SidebarIconProps, SidebarNavItem } from './admin-sidebar.types';

const navItems: Array<
  SidebarNavItem & { requiredPermission?: SystemPermission }
> = [
  {
    href: '/admin',
    label: 'Overview',
    Icon: function DashboardIcon({ className }: SidebarIconProps) {
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 13.5V6.75a.75.75 0 0 1 .75-.75h5.5v7.5H4.75a.75.75 0 0 1-.75-.75Zm0 4.75v-1.5a.75.75 0 0 1 .75-.75h5.5v4H4.75a.75.75 0 0 1-.75-.75Zm10-4.75V4.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v8.75a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75Zm0 6.5v-3.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v3.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    },
  },
  {
    href: '/admin/migrations',
    label: 'Migrations',
    Icon: function MigrationsIcon({ className }: SidebarIconProps) {
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M7.5 6.25h9a1.25 1.25 0 0 1 1.25 1.25v9a1.25 1.25 0 0 1-1.25 1.25h-9A1.25 1.25 0 0 1 6.25 16.5v-9A1.25 1.25 0 0 1 7.5 6.25Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M9 10h6M9 13.5h6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    },
  },
  {
    href: '/admin/users',
    label: 'Users',
    Icon: function UsersIcon({ className }: SidebarIconProps) {
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M16 19.5v-1.25a3.25 3.25 0 0 0-3.25-3.25h-5.5A3.25 3.25 0 0 0 4 18.25v1.25"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M10 12a3.25 3.25 0 1 0 0-6.5A3.25 3.25 0 0 0 10 12Zm8.5 3.5v-1a2.5 2.5 0 0 0-2.5-2.5h-2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M16 6.5a2.5 2.5 0 0 1 0 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    },
  },
  {
    href: '/admin/roles',
    label: 'Roles',
    Icon: function RolesIcon({ className }: SidebarIconProps) {
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 4.5 4.5 8.25 12 12l7.5-3.75L12 4.5Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M4.5 12 12 15.75 19.5 12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M4.5 15.75 12 19.5l7.5-3.75"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    },
  },
  {
    href: '/admin/acts',
    label: 'Acts',
    Icon: function ActsIcon({ className }: SidebarIconProps) {
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    },
  },

  {
    href: '/admin/finance',
    label: 'Finance',
    Icon: function FinanceIcon({ className }: SidebarIconProps) {
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4.75 7.25h14.5a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1H4.75a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M6.75 12h4.5M13 12h4.25"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    },
  },

  {
    href: '/admin/inventory',
    label: 'Inventory',
    Icon: function InventoryIcon({ className }: SidebarIconProps) {
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4.5 7.75h15a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V8.75a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M7 7.75V6.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1.25"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M8 12h8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    },
  },
  {
    href: '/admin/media',
    label: 'Media',
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
    requiredPermission: SYSTEM_PERMISSIONS.EMAIL_SEND,
    Icon: function EmailIcon({ className }: SidebarIconProps) {
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M3.75 7.5l8.25 5.25L20.25 7.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M4.75 6.75h14.5a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1H4.75a1 1 0 0 1-1-1v-8.5a1 1 0 0 1 1-1Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      );
    },
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const visibleNavItems = navItems.filter(
    ({ requiredPermission }) =>
      requiredPermission === undefined ||
      user?.scopes.includes(requiredPermission),
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
