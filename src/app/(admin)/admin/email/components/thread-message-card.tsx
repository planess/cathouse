'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import type { EmailMessageSummary } from '@app/services/email.service';

import { formatAddress } from '../helpers/format-address';
import { formatAddressList } from '../helpers/format-address-list';
import { formatEmailDate } from '../helpers/format-email-date';
import { getListedAttachments } from '../helpers/get-listed-attachments';
import { getMessageBodyHtml } from '../helpers/get-message-body-html';

import { EmailHtmlBody } from './email-html-body';

type ThreadMessageCardProps = {
  message: EmailMessageSummary;
  onForward: (message: EmailMessageSummary) => void;
};

export function ThreadMessageCard({
  message,
  onForward,
}: ThreadMessageCardProps) {
  const t = useTranslations('adminEmail.thread');
  const locale = useLocale();
  const [showFullMessage, setShowFullMessage] = useState(false);
  const strippedContent =
    message.content['stripped-html'] ?? message.content['stripped-text'];
  const fullContent = message.content.html ?? message.content.text;
  const canToggleFullMessage =
    strippedContent !== undefined &&
    fullContent !== undefined &&
    strippedContent !== fullContent;
  const bodyHtml = getMessageBodyHtml(message, showFullMessage);
  const listedAttachments = getListedAttachments(message.attachments, bodyHtml);

  return (
    <article
      className={`border-b-2 border-indigo-200 border-dashed p-5 last:border-b-0 dark:border-slate-800 md:p-6 ${
        message.direction === 'outgoing'
          ? 'bg-sky-50/60 dark:bg-sky-950/20'
          : message.isRead
            ? 'bg-slate-50/40 dark:bg-slate-900/30'
            : 'bg-amber-50/70 dark:bg-amber-950/20'
      }`}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="break-words text-xl font-bold leading-tight text-slate-950 dark:text-white">
          {message.subject}
        </h2>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            {formatEmailDate(message.headerDate, locale)}
          </span>
          <button
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            onClick={() => onForward(message)}
            type="button"
          >
            {t('forward')}
          </button>
        </div>
      </div>

      <div className="grid gap-x-4 gap-y-1.5 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-[auto_minmax(0,1fr)]">
        <span className="font-medium text-slate-500 dark:text-slate-400 sm:text-right">
          {t('from')}
        </span>
        <span className="min-w-0 break-words font-medium">
          {formatAddress(message.from)}
        </span>
        <span className="font-medium text-slate-500 dark:text-slate-400 sm:text-right">
          {t('to')}
        </span>
        <span className="min-w-0 break-words font-medium">
          {formatAddressList(message.to, t('noRecipients'))}
        </span>
        {message.cc.length > 0 && (
          <>
            <span className="font-medium text-slate-500 dark:text-slate-400 sm:text-right">
              {t('cc')}
            </span>
            <span className="min-w-0 break-words font-medium">
              {formatAddressList(message.cc, t('noRecipients'))}
            </span>
          </>
        )}
      </div>

      <div className="space-y-4 pt-5 border-t border-slate-400 dark:border-slate-800 mt-3">
        {canToggleFullMessage && (
          <div className="flex justify-end">
            <button
              aria-expanded={showFullMessage}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              onClick={() => setShowFullMessage((expanded) => !expanded)}
              type="button"
            >
              {showFullMessage ? t('collapseHistory') : t('expandFull')}
            </button>
          </div>
        )}
        <EmailHtmlBody
          className="break-words text-base leading-7 text-slate-700 dark:text-slate-200"
          html={bodyHtml}
        />

        {listedAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {listedAttachments.map((attachment) => (
              attachment.downloadUrl === undefined ? (
                <div
                  className="inline-flex items-center gap-4 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-700"
                  key={attachment.id}
                >
                  {attachment.filename}
                </div>
              ) : (
                <a
                  className="inline-flex items-center gap-4 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition hover:ring-emerald-400 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-700 dark:hover:ring-emerald-500"
                  href={attachment.downloadUrl}
                  key={attachment.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span>{attachment.filename}</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    {t('openAttachment')}
                  </span>
                </a>
              )
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
