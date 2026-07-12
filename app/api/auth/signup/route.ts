import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/validators/auth";
import { prisma } from "@/lib/db/prisma";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";
import { generateSecureToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/templates";

export async function POST(req: Request) {
  // Get IP for rate limiting
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const limitResult = await rateLimit(`signup:${ip}`, RATE_LIMITS.SIGNUP.limit, RATE_LIMITS.SIGNUP.windowSeconds);
  const headers = getRateLimitHeaders(limitResult);

  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);
    const { first, last, email, password } = validatedData;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400, headers }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create user and verification token in a transaction
    const { user, token } = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName: first,
          lastName: last,
          email: email.toLowerCase(),
          password: hashedPassword,
          verified: false,
          role: "USER", // Default role
        },
      });

      const secureToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const newToken = await tx.verificationToken.create({
        data: {
          token: secureToken,
          userId: newUser.id,
          expiresAt,
        },
      });

      return { user: newUser, token: newToken };
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, token.token);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // We don't rollback signup if email fails, but notify client they might need to resend
      return NextResponse.json(
        {
          message: "User created, but failed to send verification email. Please request a new one.",
          needsVerification: true,
          user: { id: user.id, email: user.email },
        },
        { status: 201, headers }
      );
    }

    return NextResponse.json(
      {
        message: "Signup successful. Please check your email to verify your account.",
        user: {
          id: user.id,
          first: user.firstName,
          last: user.lastName,
          email: user.email,
        },
      },
      { status: 201, headers }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500, headers }
    );
  }
}
