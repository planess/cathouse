import { useTranslations } from 'next-intl';

import type { EmailMessageSummary } from '@app/services/email.service';

import { ThreadMessageCard } from './thread-message-card';

type ThreadMessageListProps = {
  messages: EmailMessageSummary[];
  onForward: (message: EmailMessageSummary) => void;
};

export function ThreadMessageList({
  messages,
  onForward,
}: ThreadMessageListProps) {
  const t = useTranslations('adminEmail.thread');

  if (messages.length === 0) {
    return (
      <div className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
        {t('noMessages')}
      </div>
    );
  }

  return (
    <div>
      {messages.map((message) => (
        <ThreadMessageCard
          key={message.id}
          message={message}
          onForward={onForward}
        />
      ))}
    </div>
  );
}
