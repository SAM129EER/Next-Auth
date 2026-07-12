import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { comparePassword } from "@/lib/auth/password";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/tokens";
import { loginSchema } from "@/lib/validators/auth";
import { setAuthCookies } from "@/lib/auth/cookies";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { RATE_LIMITS, REFRESH_TOKEN_MAX_AGE } from "@/lib/constants";
import crypto from "crypto";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const limitResult = await rateLimit(`login:${ip}`, RATE_LIMITS.LOGIN.limit, RATE_LIMITS.LOGIN.windowSeconds);
  const headers = getRateLimitHeaders(limitResult);

  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers }
      );
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers }
      );
    }

    // Check email verification status
    if (!user.verified) {
      return NextResponse.json(
        {
          error: "Your email address is not verified. Please verify your email before logging in.",
          needsVerification: true,
        },
        { status: 403, headers }
      );
    }

    // Generate JWT access & refresh tokens
    const tokenId = crypto.randomUUID();
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, tokenId);

    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000),
      },
    });

    // Set HttpOnly cookies (access + refresh)
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { headers }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500, headers }
    );
  }
}
