import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/db/prisma";
import { COOKIE_NAMES, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "@/lib/constants";

const protectedRoutes = ["/dashboard", "/admin"];
const authRoutes = ["/login", "/signup", "/verify-email", "/resend-verification", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  const cookieStore = await cookies();
  let accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  let refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  let userPayload = accessToken ? verifyAccessToken(accessToken) : null;
  let response = NextResponse.next();
  let cookiesChanged = false;
  let newAccessToken = "";
  let newRefreshToken = "";

  // If access token is invalid but refresh token is present, try to silently refresh
  if (!userPayload && refreshToken) {
    try {
      const decodedRefresh = verifyRefreshToken(refreshToken);
      if (decodedRefresh) {
        // Verify in DB
        const dbToken = await prisma.refreshToken.findUnique({
          where: { token: refreshToken },
          include: { user: true },
        });

        if (dbToken && dbToken.expiresAt > new Date() && dbToken.user.verified) {
          // Token is valid! Rotate tokens
          const tokenId = crypto.randomUUID();
          newAccessToken = generateAccessToken(dbToken.user.id, dbToken.user.role);
          newRefreshToken = generateRefreshToken(dbToken.user.id, tokenId);

          // Update DB
          await prisma.$transaction([
            prisma.refreshToken.delete({ where: { id: dbToken.id } }),
            prisma.refreshToken.create({
              data: {
                token: newRefreshToken,
                userId: dbToken.user.id,
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000),
              },
            }),
          ]);

          userPayload = { userId: dbToken.user.id, role: dbToken.user.role };
          cookiesChanged = true;
        }
      }
    } catch (e) {
      console.error("Silent refresh failed in proxy:", e);
    }
  }

  // Handle protected route access
  if (isProtectedRoute) {
    if (!userPayload) {
      // Not logged in -> redirect to login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Role check for /admin routes
    if (path.startsWith("/admin") && userPayload.role !== "ADMIN") {
      // Forbidden -> redirect to dashboard
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Handle auth route access (redirect logged-in users away from login/signup)
  if (isAuthRoute && userPayload) {
    // Already logged in -> redirect to dashboard
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If silently refreshed, attach new cookies to response
  if (cookiesChanged && newAccessToken && newRefreshToken && userPayload) {
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/signup"],
};
