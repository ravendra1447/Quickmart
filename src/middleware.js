import { NextResponse } from 'next/server';

export function middleware(request) {
  // Route protection is handled client-side via the auth store
  // This middleware only sets up basic headers
  const response = NextResponse.next();
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('x-content-type-options', 'nosniff');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
