import { useFormatter, useTranslations } from 'next-intl';

import type { SessionsSectionProps } from '../../models/sessions-section-props';
import RevokeSessionButton from '../revoke-session-button/revoke-session-button';

/**
 * Lists the current user's active sessions with a revoke action for each.
 *
 * @param props - Section props.
 * @param props.sessions - Sessions of the current user, newest first.
 */
export default function SessionsSection({ sessions }: SessionsSectionProps) {
  const t = useTranslations('profilepage.sessions');
  const format = useFormatter();

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{t('title')}</h2>
      {sessions.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-stone-400">
          {t('empty')}
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl bg-white dark:divide-stone-700 dark:bg-stone-900">
          {sessions.map((session) => (
            <li
              className="flex items-center justify-between gap-4 px-4 py-3"
              key={session.id}
            >
              <div className="text-sm">
                <p>
                  {t('createdAt', {
                    date: format.dateTime(new Date(session.createdAt), {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }),
                  })}
                </p>
                {session.isCurrent && (
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {t('current')}
                  </p>
                )}
              </div>
              {!session.isCurrent && (
                <RevokeSessionButton sessionId={session.id} />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
