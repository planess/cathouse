import { decodeHtmlEntities } from './decode-html-entities';

export function getPlainTextFromHtml(value: string): string {
  return decodeHtmlEntities(value)
    .replaceAll(/<br\s*\/?>/gi, '\n')
    .replaceAll(/<\/(?:p|div|li|h[1-6]|blockquote)>/gi, '\n')
    .replaceAll(/<[^>]+>/g, '')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim();
}
