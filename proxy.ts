import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/password";

export function proxy(request: NextRequest) {
  // Get token
  const token = request.cookies.get("token")?.value;
  // Verify token if exists
  const decoded = token ? verifyToken(token) : null;

  // Route types
  const protectedRoutes = ["/dashboard"];

  const authRoutes = ["/login", "/signup"];

  // Current path
  const path = request.nextUrl.pathname;

  // Check route types
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );

  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // Protected route without login
  if (isProtectedRoute && !decoded) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged-in user visiting login/signup
  if (isAuthRoute && decoded) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
