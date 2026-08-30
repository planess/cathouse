import Link from 'next/link';

import { SYSTEM_PERMISSIONS } from '@app/models/system-permissions';
import {
  hasAnyPermission,
  requireAnyPermission,
} from '@app/services/access-verification.service';

import { AdminSidebar } from './admin/components/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAnyPermission([SYSTEM_PERMISSIONS.ROLE_ASSIGN]);
  const canAccessEmail = await hasAnyPermission([
    SYSTEM_PERMISSIONS.EMAIL_READ,
    SYSTEM_PERMISSIONS.EMAIL_SEND,
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="relative flex-1 overflow-x-hidden overflow-y-auto">
          <div className="absolute inset-0">
            <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-sky-200/40 blur-[120px] dark:bg-sky-500/10" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-[120px] dark:bg-emerald-500/10" />
          </div>
          <div className="relative z-10">
            <div className="lg:hidden border-b border-slate-200 bg-white/90 px-5 py-4 shadow-sm shadow-slate-200/40 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Admin Panel
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mock: Enterprise Suite
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="h-8 w-8 rounded-full bg-linear-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center">
                    AR
                  </span>
                  <span>Mock</span>
                </div>
              </div>
              <nav className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Link
                  href="/admin"
                  className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"
                >
                  Overview
                </Link>
                <Link
                  href="/admin/migrations"
                  className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"
                >
                  Migrations
                </Link>
                <Link
                  href="/admin/users"
                  className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"
                >
                  Users
                </Link>
                <Link
                  href="/admin/roles"
                  className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"
                >
                  Roles
                </Link>
                <Link
                  href="/admin/acts"
                  className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"
                >
                  Acts
                </Link>
                <Link
                  href="/admin/finance"
                  className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"
                >
                  Finance
                </Link>
                <Link
                  href="/admin/inventory"
                  className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"
                >
                  Inventory
                </Link>
                <Link
                  href="/admin/media"
                  className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"
                >
                  Media
                </Link>
                {canAccessEmail && (
                  <Link
                    href="/admin/email"
                    className="rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900"
                  >
                    Email
                  </Link>
                )}
              </nav>
            </div>
            <div className="min-h-screen px-5 pb-10 pt-6 lg:px-10 lg:pt-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
