import { NextRequest, NextResponse } from 'next/server';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { ServerActionResponse } from '@app/models/server-action-response.server';

/**
 * Ends the current session: removes it from the `sessions` collection and
 * expires the HTTP-only session cookie.
 *
 * The session token is read from the `token` cookie or, for app clients,
 * from the `Authorization: Bearer <token>` header.
 *
 * @param request - Incoming sign-out request.
 * @returns `ok` status; the session cookie is always cleared.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ServerActionResponse>> {
  const bearer = request.headers.get('authorization');
  const token =
    request.cookies.get('token')?.value ??
    (bearer?.startsWith('Bearer ') ? bearer.slice(7).trim() : undefined);

  if (token) {
    try {
      const dbClient = await clientPromise;

      await dbClient.db().collection(DbTables.sessions).deleteOne({ token });
    } catch (error) {
      console.error('Error removing session:', error);
      return NextResponse.json({ status: 'error' }, { status: 500 });
    }
  }

  const response = NextResponse.json({ status: 'ok' as const });

  response.cookies.delete('token');

  return response;
}
