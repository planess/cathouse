import { createHmac, timingSafeEqual } from 'node:crypto';

import { ObjectId } from 'mongodb';

import { DbTables } from '@app/enum/db-tables';
import clientPromise from '@app/ins/mongo-client';
import type { Session } from '@app/models/db/session';

/** Issues file-scoped playback tickets without exposing the user's session token. */
export class MediaPlaybackService {
  /**
   * Creates a ticket valid for one hour, signed with the existing session secret.
   * @param token - The authenticated app session token.
   * @param path - The canonical encoded media path.
   * @returns A playback ticket, or null when the session no longer exists.
   */
  static async create(token: string, path: string): Promise<string | null> {
    const client = await clientPromise;
    const session = await client.db()
      .collection<Session>(DbTables.sessions)
      .findOne({ token });
    if (!session) return null;

    const expires = Math.floor(Date.now() / 1000) + 3600;
    const payload = `${session._id.toHexString()}.${expires}`;
    return `${payload}.${this.sign(session.token, payload, path)}`;
  }

  /**
   * Resolves a valid ticket to its session for a fresh permission check.
   * @param ticket - The file-scoped playback ticket.
   * @param path - The canonical encoded path requested by the player.
   * @returns The server-side session token, or null for invalid or expired tickets.
   */
  static async resolve(ticket: string, path: string): Promise<string | null> {
    const match = /^([a-f0-9]{24})\.(\d{10})\.([a-f0-9]{64})$/.exec(ticket);
    if (!match) return null;
    const [, id, expires, signature] = match;
    if (Number(expires) <= Math.floor(Date.now() / 1000)) return null;

    const client = await clientPromise;
    const session = await client.db()
      .collection<Session>(DbTables.sessions)
      .findOne({ _id: new ObjectId(id) });
    if (!session) return null;

    const expected = this.sign(session.token, `${id}.${expires}`, path);
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex'),
    )
      ? session.token
      : null;
  }

  private static sign(token: string, payload: string, path: string): string {
    return createHmac('sha256', token)
      .update(JSON.stringify(['media-playback-v1', payload, path]))
      .digest('hex');
  }
}
