import { NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const COOKIE_NAME =
  typeof routing.localeCookie === 'boolean'
    ? 'test-locale-cookie'
    : (routing.localeCookie?.name ?? 'test-locale-cookie');
const SUPPORTED_LOCALES = routing.locales;

// Skip static files & Next internals
export const config = {
  matcher: ['/((?!api|_next|static|.*\\..*).*)'],
};

export default function middleware(req: NextRequest) {
  // If user already has a valid cookie — do nothing.
  const existing = req.cookies.get(COOKIE_NAME)?.value;

  if (
    existing !== undefined &&
    SUPPORTED_LOCALES.includes(existing as (typeof SUPPORTED_LOCALES)[number])
  ) {
    return NextResponse.next();
  }

  // Detect and set once.
  const detected = pickSupportedLocale(req.headers.get('accept-language'));
  const res = NextResponse.next();

  res.cookies.set({
    name: COOKIE_NAME,
    value: detected,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development', // optional
  });

  return res;
}

function pickSupportedLocale(acceptLanguage: string | null) {
  if (acceptLanguage === null) {
    return routing.defaultLocale;
  }

  // Very small parser: "uk-UA,uk;q=0.9,en;q=0.8"
  // We check each tag in order and return first supported base tag.
  for (const part of acceptLanguage.split(',')) {
    const tag = part.split(';')[0].trim().toLowerCase(); // "uk-ua" | "uk" | "en"
    const base = tag.split('-')[0]; // "uk" | "en"

    if (
      SUPPORTED_LOCALES.includes(base as (typeof SUPPORTED_LOCALES)[number])
    ) {
      return base;
    }
  }

  return routing.defaultLocale;
}
