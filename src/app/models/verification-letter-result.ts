/**
 * Outcome of sending an email verification letter: `sent` when the letter was
 * sent, `declined` when the email is already verified or the cooldown has not
 * passed, `failed` when the code could not be stored or the letter not sent.
 */
export type VerificationLetterResult = 'sent' | 'declined' | 'failed';
