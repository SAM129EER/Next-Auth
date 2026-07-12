import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { generateSecureToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email/templates";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const limitResult = await rateLimit(`forgot_pw:${ip}`, RATE_LIMITS.FORGOT_PASSWORD.limit, RATE_LIMITS.FORGOT_PASSWORD.windowSeconds);
  const headers = getRateLimitHeaders(limitResult);

  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many password reset attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await req.json();
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // To prevent email enumeration, return success even if user doesn't exist
    if (!user) {
      return NextResponse.json(
        { message: "If an account is associated with that email, a password reset link has been sent." },
        { headers }
      );
    }

    // Clean up old reset tokens and create a new one
    const secureToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({
        data: {
          token: secureToken,
          userId: user.id,
          expiresAt,
        },
      }),
    ]);

    await sendPasswordResetEmail(user.email, secureToken);

    return NextResponse.json(
      { message: "Password reset email sent. Please check your inbox." },
      { headers }
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500, headers }
    );
  }
}
