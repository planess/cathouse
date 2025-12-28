import { cookies as rawCookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

interface Messages {
  [key: string]: string | Messages;
}

export default getRequestConfig(async () => {
  const cookies = await rawCookies();
  const cookie_name =
    typeof routing.localeCookie === 'object'
      ? routing.localeCookie?.name
      : null;
  const requestLocale =
    (cookie_name !== null && cookie_name !== undefined
      ? cookies.get(cookie_name)?.value
      : null) ?? routing.defaultLocale;

  const json = (await import(`../../messages/${requestLocale}.json`)) as {
    default: Messages;
  };
  const messages = json.default;

  return {
    locale: requestLocale,
    messages,
  };
});
