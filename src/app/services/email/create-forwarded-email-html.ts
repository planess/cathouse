import type { EmailMessageSummary } from './types/email-message-summary';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatAddress(address: EmailMessageSummary['from']) {
  return address.name === undefined
    ? address.address
    : `${address.name} <${address.address}>`;
}

export function createForwardedEmailHtml(message: EmailMessageSummary): string {
  const body =
    message.content.html ??
    `<p>${escapeHtml(message.content.text ?? '').replaceAll('\n', '<br>')}</p>`;
  const to = message.to.map(formatAddress).join(', ');
  const cc = message.cc.map(formatAddress).join(', ');

  return [
    '<p><br></p>',
    '<p>---------- Forwarded message ----------</p>',
    `<p><strong>From:</strong> ${escapeHtml(formatAddress(message.from))}<br>`,
    `<strong>Date:</strong> ${escapeHtml(message.headerDate)}<br>`,
    `<strong>Subject:</strong> ${escapeHtml(message.subject)}<br>`,
    `<strong>To:</strong> ${escapeHtml(to)}`,
    cc.length === 0 ? '</p>' : `<br><strong>Cc:</strong> ${escapeHtml(cc)}</p>`,
    `<blockquote>${body}</blockquote>`,
  ].join('');
}
