'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';

import { sendVerificationEmail } from '../../actions/send-verification-email';
import type { VerifyEmailButtonProps } from '../../models/verify-email-button-props';

/**
 * Formats milliseconds as `m:ss`.
 *
 * @param ms - Duration in milliseconds.
 */
function formatRemaining(ms: number): string {
  const seconds = Math.ceil(ms / 1000);

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * "Verify" button shown next to an unverified email. Each click sends a new
 * verification letter with a new code; after that the button is locked for
 * five minutes with a countdown.
 *
 * @param props - Button props.
 * @param props.availableAt - ISO time when another letter can be sent, or `null` when it can be sent now.
 */
export default function VerifyEmailButton({
  availableAt,
}: VerifyEmailButtonProps) {
  const t = useTranslations('profilepage.personal');
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<'sent' | 'error' | null>(null);
  // Unknown until mounted, so the server and client render the same markup
  const [now, setNow] = useState<number | null>(null);

  const availableTime = availableAt ? new Date(availableAt).getTime() : 0;
  const remaining = now === null ? 0 : availableTime - now;
  const isLocked = availableTime > 0 && (now === null || remaining > 0);

  useEffect(() => {
    setNow(Date.now());

    if (availableTime <= Date.now()) {
      return;
    }

    const timer = setInterval(() => {
      const current = Date.now();

      setNow(current);

      if (current >= availableTime) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [availableTime]);

  const handleClick = () => {
    setResult(null);
    startTransition(async () => {
      const response = await sendVerificationEmail();

      // `declined` here means the cooldown has not passed; the refreshed
      // page restarts the countdown
      if (response.status !== 'declined') {
        setResult(response.status === 'ok' ? 'sent' : 'error');
      }
    });
  };

  let label = t('verify');

  if (pending) {
    label = t('verifySending');
  } else if (isLocked && now !== null) {
    label = t('verifyAgainIn', { time: formatRemaining(remaining) });
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        className="font-semibold text-emerald-700 tabular-nums hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline dark:text-emerald-300"
        disabled={pending || isLocked}
        onClick={handleClick}
        type="button"
      >
        {label}
      </button>
      {result === 'sent' && (
        <span
          className="text-xs text-slate-500 dark:text-stone-400"
          role="status"
        >
          {t('verifySent')}
        </span>
      )}
      {result === 'error' && (
        <span className="text-xs text-red-600 dark:text-red-400" role="alert">
          {t('verifyError')}
        </span>
      )}
    </span>
  );
}
