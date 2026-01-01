import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Protect /admin/* routes - require authentication
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For development: Allow access without authentication
    // In production, uncomment the authentication check below
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      // Check for session token (simplified - in production use NextAuth session)
      const token = request.cookies.get('next-auth.session-token') || 
                    request.cookies.get('__Secure-next-auth.session-token')

      if (!token) {
        // Redirect to sign in
        const signInUrl = new URL('/api/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', request.url)
        return NextResponse.redirect(signInUrl)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}

