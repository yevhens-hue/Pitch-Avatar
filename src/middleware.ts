import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get hostname of request (e.g. hr.localhost:3000, hr.pitchavatar.com)
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // If this is the admin domain, redirect root '/' to '/users'
  if (
    (hostname.includes('admin') || process.env.NEXT_PUBLIC_IS_ADMIN === 'true') && 
    pathname === '/'
  ) {
    return NextResponse.redirect(new URL('/users', request.url))
  }

  const response = NextResponse.next()

  // Pass the hostname down as a header so Server Components can read it
  response.headers.set('x-pitch-host', hostname)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
