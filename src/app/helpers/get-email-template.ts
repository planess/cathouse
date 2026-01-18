import { readFile } from 'node:fs/promises';

export async function getEmailHtml(
  name: string,
  params: Record<string, string> = {},
): Promise<string> {
  let template = await readFile(`src/email-template/${name}.html`, 'utf-8');

  for (const [key, value] of Object.entries(params)) {
    template = template.replaceAll(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return template;
}
