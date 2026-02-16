import { getTranslations } from 'next-intl/server';

export async function getSiteTitle(): Promise<string> {
  const layoutTranslations = await getTranslations('layout');

  return layoutTranslations('title');
}

export function composeMetadataTitle(
  pageTitle: string | null | undefined,
  siteTitle: string,
): string {
  const trimmedTitle = pageTitle?.trim();

  if (!trimmedTitle) {
    return siteTitle;
  }

  return `${trimmedTitle} | ${siteTitle}`;
}
