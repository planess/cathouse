import { NextRequest, NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to unavailable page and static files
  if (
    pathname.startsWith('/unavailable') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('.') // Allow files with extensions
  ) {
    return NextResponse.next();
  }

  // Redirect all other requests to unavailable page
  const url = request.nextUrl.clone();
  url.pathname = '/unavailable';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
