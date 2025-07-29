import { getRequestConfig } from 'next-intl/server';

interface Messages {
  [key: string]: string | Messages;
}

export default getRequestConfig(async () => {
  const locale = 'uk';

  const json = (await import(`../../messages/${locale}.json`)) as {
    default: Messages;
  };
  const messages = json.default;

  return {
    locale,
    messages,
  };
});
