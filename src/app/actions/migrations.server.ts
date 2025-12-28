'use server';

import { serverMigrationRunner } from '../services/migration-runner.server';

/**
 * Server action to run migrations
 * This can be called during app initialization or from other server-side code
 */
export async function runMigrations() {
  try {
    return serverMigrationRunner.runMigrations();
  } catch (error) {
    return {
      success: false,
      message: `Failed to run migrations: ${error}`,
    };
  }
}

/**
 * Server action to check migration status
 */
export async function getMigrationStatus() {
  try {
    return serverMigrationRunner.getMigrationStatus();
  } catch (error) {
    return {
      success: false,
      status: `Failed to check migration status: ${error}`,
    };
  }
}

/**
 * Server action to force run migrations
 */
export async function forceRunMigrations() {
  try {
    return serverMigrationRunner.forceRunMigrations();
  } catch (error) {
    return {
      success: false,
      message: `Failed to force run migrations: ${error}`,
    };
  }
}

/**
 * Server action to create a new migration
 */
export async function createMigration(name: string) {
  try {
    return serverMigrationRunner.createMigration(name);
  } catch (error) {
    return {
      success: false,
      message: `Failed to create migration: ${error}`,
    };
  }
}
