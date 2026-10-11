'use client';

import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import { revokeSession } from '../../actions/revoke-session';
import type { RevokeSessionButtonProps } from '../../models/revoke-session-button-props';

/**
 * Button that deletes a session from the `sessions` collection.
 *
 * @param props - Button props.
 * @param props.sessionId - Identifier of the session to revoke.
 */
export default function RevokeSessionButton({
  sessionId,
}: RevokeSessionButtonProps) {
  const t = useTranslations('profilepage.sessions');
  const [isPending, startTransition] = useTransition();
  const [hasError, setHasError] = useState(false);

  const handleClick = () => {
    setHasError(false);
    startTransition(async () => {
      const response = await revokeSession(sessionId);

      setHasError(response.status !== 'ok');
    });
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      {hasError && (
        <span className="text-xs text-red-600 dark:text-red-400">
          {t('error')}
        </span>
      )}
      <button
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
        disabled={isPending}
        onClick={handleClick}
        type="button"
      >
        {isPending ? t('revoking') : t('revoke')}
      </button>
    </div>
  );
}
