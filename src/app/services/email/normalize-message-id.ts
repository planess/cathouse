import { createMessageId } from './create-message-id';

export function normalizeMessageId(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return createMessageId();
  }

  return trimmed.startsWith('<') && trimmed.endsWith('>')
    ? trimmed
    : `<${trimmed.replaceAll(/[<>]/g, '')}>`;
}
