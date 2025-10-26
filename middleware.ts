import { auth } from '@/lib/auth/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth } = req
  const isLoggedIn = !!auth?.user
  const userRole = auth?.user?.role

  // Define route patterns
  const isPublicRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/school/login'
  const isParentRoute = nextUrl.pathname.startsWith('/gallery') ||
    nextUrl.pathname.startsWith('/cart') ||
    nextUrl.pathname.startsWith('/orders') ||
    nextUrl.pathname.startsWith('/checkout') ||
    nextUrl.pathname.startsWith('/order-confirmation')
  const isSchoolRoute = nextUrl.pathname.startsWith('/school/dashboard') ||
    nextUrl.pathname.startsWith('/school/orders')

  // Redirect to login if trying to access protected routes while not logged in
  if (!isLoggedIn && (isParentRoute || isSchoolRoute)) {
    if (isSchoolRoute) {
      return NextResponse.redirect(new URL('/school/login', nextUrl))
    }
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Redirect logged-in users away from login pages
  if (isLoggedIn && isPublicRoute) {
    if (userRole === 'school') {
      return NextResponse.redirect(new URL('/school/dashboard', nextUrl))
    }
    if (userRole === 'parent' && auth?.user?.studentId) {
      return NextResponse.redirect(new URL(`/gallery/${auth.user.studentId}`, nextUrl))
    }
  }

  // Prevent role-based access violations
  if (isLoggedIn) {
    // Parents trying to access school routes
    if (userRole === 'parent' && isSchoolRoute) {
      return NextResponse.redirect(new URL('/gallery', nextUrl))
    }

    // Schools trying to access parent routes
    if (userRole === 'school' && isParentRoute) {
      return NextResponse.redirect(new URL('/school/dashboard', nextUrl))
    }
  }

  // Redirect root to appropriate login page
  if (nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
