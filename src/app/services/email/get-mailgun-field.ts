export function getMailgunField(
  fields: Record<string, string>,
  ...fieldNames: string[]
) {
  for (const fieldName of fieldNames) {
    const directValue = fields[fieldName];

    if (directValue !== undefined) {
      return directValue;
    }

    const matchingEntry = Object.entries(fields).find(
      ([key]) => key.toLowerCase() === fieldName.toLowerCase(),
    );

    if (matchingEntry !== undefined) {
      return matchingEntry[1];
    }
  }

  return;
}
