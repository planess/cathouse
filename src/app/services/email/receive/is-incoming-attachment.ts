import type { IncomingAttachment } from './types/incoming-attachment';

export function isIncomingAttachment(
  attachment: IncomingAttachment | null,
): attachment is IncomingAttachment {
  return attachment !== null;
}
