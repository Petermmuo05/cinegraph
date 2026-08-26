import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next internals, auth APIs, health check
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") // static assets (.jpg, .png, .svg, etc.)
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  let isAuthenticated = false;

  if (sessionCookie?.value) {
    const session = await verifySessionToken(sessionCookie.value);
    if (session && session.userId) {
      isAuthenticated = true;
    }
  }

  // 1. If trying to access /login while already authenticated, redirect to /
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 2. If trying to access any protected page or API while unauthenticated, redirect to /login
  if (!isAuthenticated) {
    // For API routes, return 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }
    // For web pages, redirect to /login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
