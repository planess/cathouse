/**
 * Outcome of an email verification attempt:
 * - `verified` — the email has just been confirmed;
 * - `already-verified` — the email was confirmed before;
 * - `invalid` — the link is incomplete or the code does not match;
 * - `wrong-user` — the link belongs to a user other than the signed-in one.
 */
export type VerifyEmailResult =
  | 'verified'
  | 'already-verified'
  | 'invalid'
  | 'wrong-user';
