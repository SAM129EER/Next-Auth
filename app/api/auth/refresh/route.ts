import { NextResponse } from "next/server";
import { getRefreshTokenFromCookies, setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/db/prisma";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { RATE_LIMITS, REFRESH_TOKEN_MAX_AGE } from "@/lib/constants";
import crypto from "crypto";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const limitResult = await rateLimit(`refresh:${ip}`, RATE_LIMITS.REFRESH.limit, RATE_LIMITS.REFRESH.windowSeconds);
  const headers = getRateLimitHeaders(limitResult);

  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const refreshToken = await getRefreshTokenFromCookies();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401, headers }
      );
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      await clearAuthCookies();
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401, headers }
      );
    }

    // Find the token in the DB to prevent reuse
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      if (dbToken) {
        // Expired, delete it
        await prisma.refreshToken.delete({ where: { id: dbToken.id } });
      }
      await clearAuthCookies();
      return NextResponse.json(
        { error: "Expired or invalid session" },
        { status: 401, headers }
      );
    }

    if (!dbToken.user.verified) {
      await clearAuthCookies();
      return NextResponse.json(
        { error: "User is not verified" },
        { status: 403, headers }
      );
    }

    // Refresh token is valid! Rotate it.
    const newTokId = crypto.randomUUID();
    const newAccessToken = generateAccessToken(dbToken.user.id, dbToken.user.role);
    const newRefreshToken = generateRefreshToken(dbToken.user.id, newTokId);

    // Update in DB (delete old, insert new)
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

    // Set new cookies
    await setAuthCookies(newAccessToken, newRefreshToken);

    return NextResponse.json(
      { message: "Token refreshed successfully" },
      { headers }
    );
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers }
    );
  }
}
