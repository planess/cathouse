'use client';

import { useState } from 'react';

import { runMigrations, getMigrationStatus, forceRunMigrations, createMigration } from '../../../../actions/migrations.server';

export function MigrationManager() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [migrationName, setMigrationName] = useState('');

  const handleCheckStatus = async () => {
    setLoading(true);

    try {
      const result = await getMigrationStatus();

      if (result.success) {
        setStatus(result.status);
      } else {
        setStatus(`Error: ${result.status}`);
      }
    } catch (error) {
      setStatus(`Failed to check status: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMigrations = async () => {
    setLoading(true);

    try {
      const result = await runMigrations();

      setStatus(result.message);
    } catch (error) {
      setStatus(`Failed to run migrations: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForceRunMigrations = async () => {
    setLoading(true);

    try {
      const result = await forceRunMigrations();

      setStatus(result.message);
    } catch (error) {
      setStatus(`Failed to force run migrations: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMigration = async () => {
    if (!migrationName.trim()) {
      setStatus('Migration name is required');

      return;
    }

    setLoading(true);

    try {
      const result = await createMigration(migrationName);

      setStatus(result.message);

      if (result.success) {
        setMigrationName('');
      }
    } catch (error) {
      setStatus(`Failed to create migration: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Database Migration Manager</h2>

      <div className="space-y-4">
        {/* Check Status */}
        <div className="flex gap-2">
          <button
            onClick={handleCheckStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Check Migration Status
          </button>
        </div>

        {/* Run Migrations */}
        <div className="flex gap-2">
          <button
            onClick={handleRunMigrations}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Run Pending Migrations
          </button>

          <button
            onClick={handleForceRunMigrations}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Force Run Migrations
          </button>
        </div>

        {/* Create Migration */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={migrationName}
            onChange={(e) => setMigrationName(e.target.value)}
            placeholder="Migration name (e.g., add-new-feature)"
            className="px-3 py-2 border border-gray-300 rounded flex-1"
          />
          <button
            onClick={handleCreateMigration}
            disabled={loading || !migrationName.trim()}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Create Migration
          </button>
        </div>

        {/* Status Display */}
        {status && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Status:</h3>
            <pre className="whitespace-pre-wrap text-sm">{status}</pre>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Note:</strong> Use this interface for manual migration management and development.</p>
      </div>
    </div>
  );
}
