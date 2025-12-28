import { NextRequest, NextResponse } from 'next/server';

import { serverMigrationRunner } from '../../services/migration-runner.server';

/**
 * API route for managing database migrations
 * GET: Check migration status
 * POST: Run migrations
 */
export async function GET() {
  try {
    const result = await serverMigrationRunner.getMigrationStatus();

    if (result.success) {
      return NextResponse.json({
        success: true,
        status: result.status
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.status
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to check migration status: ${error}`
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, migrationName } = body;

    switch (action) {
      case 'run':
        const result = await serverMigrationRunner.runMigrations();

        return NextResponse.json(result);

      case 'force':
        const forceResult = await serverMigrationRunner.forceRunMigrations();

        return NextResponse.json(forceResult);

      case 'create':
        if (!migrationName) {
          return NextResponse.json({
            success: false,
            error: 'Migration name is required'
          }, { status: 400 });
        }
        const createResult = await serverMigrationRunner.createMigration(migrationName);

        return NextResponse.json(createResult);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: run, force, or create'
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to execute migration action: ${error}`
    }, { status: 500 });
  }
}
