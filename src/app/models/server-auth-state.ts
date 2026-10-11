import type { ObjectId } from 'mongodb';

import type { Sex } from './sex';

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
      /** Data from the `profiles` collection; missing values are `null`. */
      profile: {
        /** Given name. */
        firstName: string | null;
        /** Family name. */
        lastName: string | null;
        /** Public volunteer nickname. */
        alias: string | null;
        /** User sex. */
        sex: Sex | null;
        /** Free-form volunteer description. */
        about: string | null;
        /** Profile photo reference. */
        profilePhoto: string | null;
        /** Date until which the volunteer badge is valid. */
        badgeValidUntil: Date | null;
        /** Date the user became a volunteer; `null` for non-volunteers. */
        hiredOn: Date | null;
        /** Phone number as entered by the user. */
        phone: string | null;
      };
    }
  | null;
