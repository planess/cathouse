import { DateTime } from 'luxon';

type RegistryLightTranslateFn = Awaited<
  ReturnType<typeof import('next-intl/server').getTranslations>
>;

export function getRegistryLightAgeLabel(
  age: number | null,
  t: RegistryLightTranslateFn,
) {
  if (age === null) {
    return null;
    return t('cards.ageUnknown');
  }

  return t('cards.age', { age });
}

export function formatRegistryLightSeenLabel(
  lastSeenAt: string | null,
  locale: string,
  t: RegistryLightTranslateFn,
) {
  if (lastSeenAt === null) {
    return t('cards.seenUnknown');
  }

  const parsed = DateTime.fromISO(lastSeenAt).setLocale(locale);

  if (!parsed.isValid) {
    return t('cards.seenUnknown');
  }

  const now = DateTime.now().setLocale(locale);

  if (parsed.hasSame(now, 'day')) {
    return t('cards.today');
  }

  if (parsed.plus({ days: 1 }).hasSame(now, 'day')) {
    return t('cards.yesterday');
  }

  if (now.diff(parsed, 'days').days < 7) {
    return t('cards.thisWeek');
  }

  return parsed.toLocaleString(DateTime.DATE_MED);
}
