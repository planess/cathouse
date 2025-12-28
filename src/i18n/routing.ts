import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'uk'],
  defaultLocale: 'uk',
  localePrefix: 'never',
  localeDetection: true,
  localeCookie: {
    name: 'test-locale-cookie',
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    domain: undefined,
    secure: process.env.NODE_ENV === 'production',
    priority: 'medium',
    partitioned: false,
  },
});

export default routing;
