import { normalizeMessageId } from './normalize-message-id';

export function parseReferences(value: string | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  const references = value.match(/<[^>]+>/g) ?? [];

  if (references.length > 0) {
    return references.map(normalizeMessageId);
  }

  return value
    .split(/\s+/)
    .map((reference) => reference.trim())
    .filter((reference) => reference.length > 0)
    .map(normalizeMessageId);
}
