import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the token from the cookie
  const token = request.cookies.get('token')?.value

  // Get the user role from somewhere (depends on your implementation)
  const userRole = request.cookies.get('userRole')?.value

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/']
  const currentPath = request.nextUrl.pathname

  // Check if the request is for a public path
  if (publicPaths.includes(currentPath)) {
    // If user is already authenticated, redirect to their dashboard
    if (token) {
      switch (userRole) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin', request.url))
        case 'agent':
          return NextResponse.redirect(new URL('/agent', request.url))
        case 'client':
          return NextResponse.redirect(new URL('/client', request.url))
        default:
          return NextResponse.next()
      }
    }
    return NextResponse.next()
  }

  // Protected routes logic
  if (!token) {
    // Redirect to login if no token is present
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access control
  if (currentPath.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (currentPath.startsWith('/agent') && userRole !== 'agent') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (currentPath.startsWith('/client') && userRole !== 'client') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
