import type { EmailAddress } from '@app/models/email-address.model';

export function parseEmailAddress(value: string): EmailAddress {
  const trimmed = value.trim();
  const match = /^(.*?)\s*<([^>]+)>$/.exec(trimmed);
  const name = match?.[1]?.replaceAll(/^"|"$/g, '').trim();
  const rawAddress = (match?.[2] ?? trimmed).trim();
  const addressMatch = /([^\s<>]+@[^\s<>]+)/.exec(rawAddress);
  const address = (addressMatch?.[1] ?? rawAddress).trim();
  const normalizedAddress = address.toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedAddress)) {
    throw new Error('Invalid recipient email.');
  }

  return {
    ...(name !== undefined && name.length > 0 ? { name } : {}),
    address,
    normalizedAddress,
  };
}
