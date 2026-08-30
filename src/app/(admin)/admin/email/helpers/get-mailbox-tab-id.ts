export function getMailboxTabId(mailboxId: string): string {
  return `mailbox-${mailboxId}`;
}

export function getMailboxIdFromTabId(tabId: string): string {
  return tabId.replace(/^mailbox-/, '');
}
