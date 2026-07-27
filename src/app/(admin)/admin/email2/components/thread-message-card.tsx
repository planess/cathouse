import type { EmailMessageSummary } from '@app/services/email.service';

import { formatAddress } from '../helpers/format-address';
import { formatAddressList } from '../helpers/format-address-list';
import { formatEmailDate } from '../helpers/format-email-date';
import { getMessageBody } from '../helpers/get-message-body';

type ThreadMessageCardProps = {
  message: EmailMessageSummary;
  onForward: (message: EmailMessageSummary) => void;
};

export function ThreadMessageCard({
  message,
  onForward,
}: ThreadMessageCardProps) {
  return (
    <article className="border-b border-slate-200 bg-slate-50/40 p-5 last:border-b-0 dark:border-slate-800 dark:bg-slate-900/30 md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="break-words text-xl font-bold leading-tight text-slate-950 dark:text-white">
          {message.subject}
        </h2>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            {formatEmailDate(message.headerDate)}
          </span>
          <button
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            onClick={() => onForward(message)}
            type="button"
          >
            Forward
          </button>
        </div>
      </div>

      <div className="grid gap-x-4 gap-y-1.5 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-[auto_minmax(0,1fr)]">
        <span className="font-medium text-slate-500 dark:text-slate-400 sm:text-right">
          From:
        </span>
        <span className="min-w-0 break-words font-medium">
          {formatAddress(message.from)}
        </span>
        <span className="font-medium text-slate-500 dark:text-slate-400 sm:text-right">
          To:
        </span>
        <span className="min-w-0 break-words font-medium">
          {formatAddressList(message.to, 'No recipients')}
        </span>
        {message.cc.length > 0 && (
          <>
            <span className="font-medium text-slate-500 dark:text-slate-400 sm:text-right">
              Cc:
            </span>
            <span className="min-w-0 break-words font-medium">
              {formatAddressList(message.cc, 'No recipients')}
            </span>
          </>
        )}
      </div>

      <div className="pt-5">
        <p className="whitespace-pre-wrap break-words text-base leading-7 text-slate-700 dark:text-slate-200">
          {getMessageBody(message)}
        </p>

        {message.attachmentsCount > 0 && (
          <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-700">
            {message.attachmentsCount} Attachments
          </div>
        )}
      </div>
    </article>
  );
}
