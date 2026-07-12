import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const limitResult = await rateLimit(`reset_pw:${ip}`, RATE_LIMITS.RESET_PASSWORD.limit, RATE_LIMITS.RESET_PASSWORD.windowSeconds);
  const headers = getRateLimitHeaders(limitResult);

  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  try {
    const body = await req.json();
    const validatedData = resetPasswordSchema.parse(body);
    const { token, password } = validatedData;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid password reset link or link has already been used." },
        { status: 400, headers }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      // Token is expired. Delete it.
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { error: "Password reset link has expired. Please request a new one." },
        { status: 400, headers }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Update user password and invalidate all sessions/tokens in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
      prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return NextResponse.json(
      { message: "Password has been reset successfully. You can now login with your new password." },
      { headers }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500, headers }
    );
  }
}
