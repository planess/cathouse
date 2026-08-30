export function parseContentIdMap(value: string | undefined) {
  const contentIdsByAttachmentField = new Map<string, string>();

  if (value === undefined || value.trim().length === 0) {
    return contentIdsByAttachmentField;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (typeof parsed === 'object' && parsed !== null) {
      for (const [contentId, attachmentField] of Object.entries(parsed)) {
        if (typeof attachmentField === 'string') {
          contentIdsByAttachmentField.set(
            attachmentField,
            contentId.replaceAll(/[<>]/g, ''),
          );
        }
      }
    }
  } catch {
    return contentIdsByAttachmentField;
  }

  return contentIdsByAttachmentField;
}
