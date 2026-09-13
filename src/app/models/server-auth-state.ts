import type { ObjectId } from 'mongodb';

/** Server-side representation of an authenticated user, or `null` for an anonymous request. */
export type ServerAuthState =
  | {
      /** User identifier. */
      id: ObjectId;
      /** User email address. */
      email: string;
      /** Whether the email address has been verified. */
      emailVerified: boolean;
      /** Whether the account is active. */
      isActive: boolean;
      /** User permission scopes. */
      scopes: string[];
      /** User creation time. */
      createdAt: Date;
      /** Optional profile names. */
      profile: {
        /** Given name. */
        firstName: string | null;
        /** Family name. */
        lastName: string | null;
      };
    }
  | null;
