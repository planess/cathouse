import { execSync } from 'child_process';
import { join } from 'path';

/**
 * Server-side migration runner
 * This should only be called from server-side code (API routes, server actions, etc.)
 */
export class ServerMigrationRunner {
  private static instance: ServerMigrationRunner;
  private migrationsRun = false;

  private constructor() { }

  public static getInstance(): ServerMigrationRunner {
    if (!ServerMigrationRunner.instance) {
      ServerMigrationRunner.instance = new ServerMigrationRunner();
    }
    return ServerMigrationRunner.instance;
  }

  /**
   * Check if migrations should run
   */
  private shouldRunMigrations(): boolean {
    // Only run migrations in production or when explicitly enabled
    const isProduction = process.env.NODE_ENV === 'production';
    const forceMigrations = process.env.FORCE_MIGRATIONS === 'true';

    return isProduction || forceMigrations;
  }

  /**
   * Run all pending migrations
   * This should be called from server-side code only
   */
  public async runMigrations(): Promise<{ success: boolean; message: string }> {
    if (this.migrationsRun) {
      return { success: true, message: 'Migrations already run in this session' };
    }

    // Skip migrations in development unless forced
    if (!this.shouldRunMigrations()) {
      return {
        success: true,
        message: 'Skipping migrations in development mode. Set FORCE_MIGRATIONS=true to enable.'
      };
    }

    try {
      console.log('Running database migrations...');

      // Get the project root directory
      const projectRoot = process.cwd();

      // Run migrations using migrate-mongo
      execSync('npx migrate-mongo up', {
        cwd: projectRoot,
        stdio: 'pipe', // Capture output instead of inheriting
        env: { ...process.env }
      });

      console.log('Database migrations completed successfully');
      this.migrationsRun = true;

      return { success: true, message: 'Database migrations completed successfully' };
    } catch (error) {
      const errorMessage = `Error running migrations: ${error}`;

      console.error(errorMessage);

      // In production, you might want to fail fast
      if (process.env.NODE_ENV === 'production') {
        console.error('Migration failed in production. Application may not function correctly.');
      }

      return { success: false, message: errorMessage };
    }
  }

  /**
   * Check migration status
   */
  public async getMigrationStatus(): Promise<{ success: boolean; status: string }> {
    try {
      const projectRoot = process.cwd();
      const output = execSync('npx migrate-mongo status', {
        cwd: projectRoot,
        encoding: 'utf8',
        env: { ...process.env }
      });

      return { success: true, status: output };
    } catch (error) {
      return {
        success: false,
        status: `Error checking migration status: ${error}`
      };
    }
  }

  /**
   * Create a new migration file
   */
  public async createMigration(name: string): Promise<{ success: boolean; message: string }> {
    try {
      const projectRoot = process.cwd();
      const output = execSync(`npx migrate-mongo create ${name}`, {
        cwd: projectRoot,
        encoding: 'utf8',
        env: { ...process.env }
      });

      return { success: true, message: output };
    } catch (error) {
      return {
        success: false,
        message: `Error creating migration: ${error}`
      };
    }
  }

  /**
   * Force run migrations (useful for development/testing)
   */
  public async forceRunMigrations(): Promise<{ success: boolean; message: string }> {
    this.migrationsRun = false;

    return await this.runMigrations();
  }

  /**
   * Reset migration state (useful for testing)
   */
  public resetMigrationState(): void {
    this.migrationsRun = false;
  }
}

export const serverMigrationRunner = ServerMigrationRunner.getInstance();
