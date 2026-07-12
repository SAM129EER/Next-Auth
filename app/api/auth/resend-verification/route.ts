import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resendVerificationSchema } from "@/lib/validators/auth";
import { generateSecureToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/templates";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const limitResult = await rateLimit(`resend_verify:${ip}`, RATE_LIMITS.RESEND_VERIFICATION.limit, RATE_LIMITS.RESEND_VERIFICATION.windowSeconds);
  const headers = getRateLimitHeaders(limitResult);

  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429, headers }
    );
  }

  try {
    const body = await req.json();
    const validatedData = resendVerificationSchema.parse(body);
    const { email } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // To prevent email enumeration, return success even if user doesn't exist
    if (!user) {
      return NextResponse.json(
        { message: "If the account exists and is unverified, a verification email has been sent." },
        { headers }
      );
    }

    if (user.verified) {
      return NextResponse.json(
        { error: "This email address is already verified." },
        { status: 400, headers }
      );
    }

    // Clean up old tokens and generate a new one
    const secureToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
      prisma.verificationToken.create({
        data: {
          token: secureToken,
          userId: user.id,
          expiresAt,
        },
      }),
    ]);

    await sendVerificationEmail(user.email, secureToken);

    return NextResponse.json(
      { message: "Verification email sent. Please check your inbox." },
      { headers }
    );
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500, headers }
    );
  }
}
