import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Utiliser Node.js runtime au lieu de Edge Runtime pour supporter Mongoose
export const runtime = 'nodejs';

export default auth((req) => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;
  const userRole = auth?.user?.role;

  // Logs de debug pour /checkout
  if (nextUrl.pathname.startsWith("/checkout")) {
    console.log("🔍 [Middleware] Route /checkout:", {
      pathname: nextUrl.pathname,
      isLoggedIn,
      userRole,
      hasAuth: !!auth,
      hasUser: !!auth?.user,
      studentId: auth?.user?.studentId,
    });
  }

  // Define route patterns
  const isPublicRoute =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/school/login" ||
    nextUrl.pathname === "" ||
    nextUrl.pathname === "/backoffice/login";
  const isParentRoute =
    nextUrl.pathname.startsWith("/gallery") ||
    nextUrl.pathname.startsWith("/cart") ||
    nextUrl.pathname.startsWith("/orders") ||
    nextUrl.pathname.startsWith("/checkout") ||
    nextUrl.pathname.startsWith("/order-confirmation");
  const isSchoolRoute =
    nextUrl.pathname.startsWith("/school/dashboard") ||
    nextUrl.pathname.startsWith("/school/orders");
  const isAdminRoute =
    nextUrl.pathname.startsWith("/backoffice/dashboard") ||
    nextUrl.pathname.startsWith("/backoffice/schools") ||
    nextUrl.pathname.startsWith("/backoffice/orders") ||
    nextUrl.pathname.startsWith("/backoffice/students");

  // Redirect to login if trying to access protected routes while not logged in
  if (!isLoggedIn && (isParentRoute || isSchoolRoute || isAdminRoute)) {
    if (nextUrl.pathname.startsWith("/checkout")) {
      console.log("❌ [Middleware] /checkout - Non authentifié, redirection vers /login");
    }
    if (isSchoolRoute) {
      return NextResponse.redirect(new URL("/school/login", nextUrl));
    }
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/backoffice/login", nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect logged-in users away from login pages
  if (isLoggedIn && isPublicRoute) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/backoffice/dashboard", nextUrl));
    }
    if (userRole === "school") {
      return NextResponse.redirect(new URL("/school/dashboard", nextUrl));
    }
    if (userRole === "parent" && auth?.user?.studentId) {
      return NextResponse.redirect(
        new URL(`/gallery/${auth.user.studentId}`, nextUrl)
      );
    }
  }

  // Prevent role-based access violations
  if (isLoggedIn) {
    // Non-admins trying to access admin routes
    if (userRole !== "admin" && isAdminRoute) {
      if (userRole === "school") {
        return NextResponse.redirect(new URL("/school/dashboard", nextUrl));
      }
      if (userRole === "parent" && auth?.user?.studentId) {
        return NextResponse.redirect(
          new URL(`/gallery/${auth.user.studentId}`, nextUrl)
        );
      }
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Parents trying to access school routes
    if (userRole === "parent" && isSchoolRoute) {
      return NextResponse.redirect(new URL("/gallery", nextUrl));
    }

    // Schools trying to access parent routes
    if (userRole === "school" && isParentRoute) {
      return NextResponse.redirect(new URL("/school/dashboard", nextUrl));
    }
  }

  // Redirect root to appropriate login page
  if (nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
