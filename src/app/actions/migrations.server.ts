'use server';

import { revalidatePath } from 'next/cache';

import { serverMigrationRunner } from '../services/migration-runner.server';

/**
 * Server action to run pending migrations and refresh the admin page
 */
export async function runPendingMigrations() {
  try {
    const result = await serverMigrationRunner.runMigrations();

    revalidatePath('/admin/migrations');

    return result;
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
 * Server action to revert the last migration and refresh the admin page
 */
export async function revertLastMigration() {
  try {
    const result = await serverMigrationRunner.revertLastMigration();

    revalidatePath('/admin/migrations');

    return result;
  } catch (error) {
    return {
      success: false,
      message: `Failed to revert migration: ${error}`,
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
