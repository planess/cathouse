import type { EmailMessageSummary } from '@app/services/email.service';

import { ThreadMessageCard } from './thread-message-card';

type ThreadMessageListProps = {
  messages: EmailMessageSummary[];
};

export function ThreadMessageList({ messages }: ThreadMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
        No messages.
      </div>
    );
  }

  return (
    <div>
      {messages.map((message) => (
        <ThreadMessageCard key={message.id} message={message} />
      ))}
    </div>
  );
}
