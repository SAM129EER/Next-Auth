import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification link or link has already been used." },
        { status: 400 }
      );
    }

    if (verificationToken.expiresAt < new Date()) {
      // Token is expired. Delete it.
      await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
      return NextResponse.json(
        { error: "Verification link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark user as verified and delete verification tokens in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { verified: true },
      }),
      prisma.verificationToken.deleteMany({
        where: { userId: verificationToken.userId },
      }),
    ]);

    return NextResponse.json({
      message: "Email verified successfully. You can now login.",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
