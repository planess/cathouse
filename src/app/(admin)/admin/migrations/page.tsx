import { getTranslations } from 'next-intl/server';

import {
  getMigrationStatus,
  revertLastMigration,
  runPendingMigrations,
} from '@app/actions/migrations.server';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';

import type { Metadata } from 'next';

type MigrationState = 'applied' | 'pending' | 'unknown';

type MigrationRow = {
  name: string;
  status: MigrationState;
  timestamp: string;
};

function formatMigrationName(fileName: string): string {
  return fileName.replace(/\.js$/i, '').replace(/^\d{14}[_-]/, '');
}

function parseMigrationStatus(output: string): MigrationRow[] {
  const lines = output.split(/\r?\n/).map((line) => line.trim());
  const rows: MigrationRow[] = [];

  for (const rawLine of lines) {
    const line = rawLine
      .split(/\s+/)
      .filter((part) => part.length > 0 && !/\d{2,3}m.+\d{2,3}m/.test(part)); // Filter out ANSI color codes

    if (!line[0]?.includes('.js')) {
      continue;
    }

    const nameMatch =
      line[0].match(/(\d{14}[_-][\w.-]+\.js)/) ??
      line[0].match(/["']([^"']+\.js)["']/);

    if (!nameMatch) {
      continue;
    }

    const fileName = nameMatch[1];

    let timestamp = new Date(line[1]).toLocaleString();
    let status: MigrationState = 'unknown';

    if (timestamp === 'Invalid Date') {
      if (line[1].toLowerCase() === 'pending') {
        status = 'pending';
        timestamp = 'N/A';
      } else {
        timestamp = 'N/A';
      }
    } else if (/\d{13}/.test(line[2])) {
      status = 'applied';
    }

    rows.push({
      name: fileName,
      status,
      timestamp,
    });
  }

  return rows.reverse(); // Show most recent first
}

export default async function AdminPage() {
  const statusResult = await getMigrationStatus();
  const migrations = statusResult.success
    ? parseMigrationStatus(statusResult.status)
    : [];
  const statusMessage = statusResult.success ? null : statusResult.status;

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">
            Database
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            MongoDB Migration
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Manage schema versioning and data transformations. Deploy new
            updates to the production cluster or roll back changes securely.
          </p>
        </div>
        <div className="flex gap-3 flex-col">
          <button
            type="submit"
            onClick={revertLastMigration}
            className="text-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            Revert Last One
          </button>

          <button
            type="submit"
            onClick={runPendingMigrations}
            className="text-center gap-2 rounded-xl bg-sky-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700"
          >
            Run Pending
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <th className="px-6 py-3">Migration Name</th>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {migrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm">
                  {statusMessage ?? 'No migrations found.'}
                </td>
              </tr>
            ) : (
              migrations.map((migration) => (
                <tr
                  key={migration.name}
                  className="transition hover:bg-slate-50/60"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500">
                        DB
                      </span>
                      <span className="font-semibold text-slate-700">
                        {formatMigrationName(migration.name)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">
                    {migration.timestamp}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                        migration.status === 'pending'
                          ? 'border-amber-100 bg-amber-50 text-amber-700'
                          : migration.status === 'applied'
                            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          migration.status === 'pending'
                            ? 'bg-amber-500'
                            : migration.status === 'applied'
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                        }`}
                      />
                      {migration.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
        <div className="rounded-lg bg-amber-100 p-2 text-amber-600">!</div>
        <div>
          <h3 className="text-sm font-bold text-amber-900">
            Production Safeguard Active
          </h3>
          <p className="mt-1 text-[13px] text-amber-700">
            Running pending migrations will perform a write operation across the
            entire cluster. It is recommended to perform a snapshot backup
            before proceeding with large schema changes.
          </p>
        </div>
      </div>
    </section>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, siteTitle] = await Promise.all([
    getTranslations('adminpage'),
    getSiteTitle(),
  ]);

  return {
    title: composeMetadataTitle(t('migrations.title'), siteTitle),
  };
}
