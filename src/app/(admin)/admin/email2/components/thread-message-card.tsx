import type { EmailMessageSummary } from '@app/services/email.service';

import { formatAddress } from '../helpers/format-address';
import { formatAddressList } from '../helpers/format-address-list';
import { formatEmailDate } from '../helpers/format-email-date';
import { getMessageBody } from '../helpers/get-message-body';

type ThreadMessageCardProps = {
  message: EmailMessageSummary;
};

export function ThreadMessageCard({ message }: ThreadMessageCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <header className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {message.subject}
          </h2>

          <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-300">
            <div className="grid gap-2 sm:grid-cols-[3rem_minmax(0,1fr)]">
              <span className="text-slate-500 dark:text-slate-400">
                From:
              </span>
              <span className="font-medium">{formatAddress(message.from)}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-[3rem_minmax(0,1fr)]">
              <span className="text-slate-500 dark:text-slate-400">To:</span>
              <span className="font-medium">
                {formatAddressList(message.to, 'No recipients')}
              </span>
            </div>
            {message.cc.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-[3rem_minmax(0,1fr)]">
                <span className="text-slate-500 dark:text-slate-400">
                  Cc:
                </span>
                <span className="font-medium">
                  {formatAddressList(message.cc, 'No recipients')}
                </span>
              </div>
            )}
          </div>
        </div>

        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {formatEmailDate(message.headerDate)}
        </span>
      </header>

      <div className="px-6 py-7">
        <p className="whitespace-pre-wrap text-base leading-7 text-slate-700 dark:text-slate-200">
          {getMessageBody(message)}
        </p>

        {message.attachmentsCount > 0 && (
          <div className="mt-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            {message.attachmentsCount} Attachments
          </div>
        )}
      </div>
    </article>
  );
}
